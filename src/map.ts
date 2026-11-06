import 'maplibre-gl/dist/maplibre-gl.css';
import './assets/styles/styles.css';
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type ExpressionSpecification,
} from 'maplibre-gl';
// MapLibre looks for its worker next to its own module, which bundling breaks: point it at the emitted file.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { amenityLabel, escapeHtml, hoursHtml, prettify } from './format';
import { setupLocale, t, tCount } from './i18n';
import { cuisinesByCount, loadPlaces, normalizeText, type Place, type Span } from './places';

const DATA_URL = `${import.meta.env.BASE_URL}rio-food.geojson`;
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const RIO_CENTER: [number, number] = [-43.3, -22.92];
const LAYER_ID = 'places';
/** Pause after the last keystroke before re-filtering, so the map isn't redrawn on every key. */
const SEARCH_DEBOUNCE_MS = 250;

/** Pin colors per amenity (Flexoki 600s); keep in sync with `.legend-dot` in map-view.css. */
const AMENITY_COLORS: Record<string, string> = {
  restaurant: '#af3029',
  fast_food: '#bc5215',
  bar: '#5e409d',
  cafe: '#205ea6',
};
const OTHER_COLOR = '#6f6e69';

/** Value of the "no cuisine listed" and "no hours listed" checkboxes. */
const NO_CUISINE = '';
const NO_HOURS = 'unknown';

const form = document.querySelector<HTMLFormElement>('#map-filters')!;
const cuisineOptions = document.querySelector<HTMLElement>('#cuisine-options')!;
const resultCount = document.querySelector<HTMLElement>('#result-count')!;
const dialog = document.querySelector<HTMLDialogElement>('#place-dialog')!;

/** Appends a checked checkbox per cuisine, most common first. */
function fillCuisineOptions(places: Place[]): void {
  const html = cuisinesByCount(places)
    .map(
      (cuisine) =>
        `<label class="check"><input type="checkbox" name="cuisine" value="${escapeHtml(cuisine)}" checked /> <span>${escapeHtml(prettify(cuisine))}</span></label>`,
    )
    .join('');
  cuisineOptions.insertAdjacentHTML('beforeend', html);
}

interface Filters {
  query: string;
  amenities: Set<string>;
  cuisines: Set<string>;
  spans: Set<Span | typeof NO_HOURS>;
}

function readFilters(): Filters {
  const data = new FormData(form);
  const values = (name: string) => new Set(data.getAll(name).map(String));
  return {
    query: normalizeText(String(data.get('q') ?? '').trim()),
    amenities: values('amenity'),
    cuisines: values('cuisine'),
    spans: values('span') as Filters['spans'],
  };
}

/** Groups combine with AND; checked values within a group combine with OR. */
function matches(place: Place, { query, amenities, cuisines, spans }: Filters): boolean {
  // Same text match as the list page: name, neighbourhood and cuisines.
  if (query && !place.searchText.includes(query)) return false;
  const cuisineMatch = place.cuisines.length
    ? place.cuisines.some((cuisine) => cuisines.has(cuisine))
    : cuisines.has(NO_CUISINE);
  const spanMatch = place.spans.size
    ? [...place.spans].some((span) => spans.has(span))
    : spans.has(NO_HOURS);
  // Places of an unexpected type have no checkbox, so they're never hidden by type.
  const amenityMatch = !(place.amenity in AMENITY_COLORS) || amenities.has(place.amenity);
  return amenityMatch && cuisineMatch && spanMatch;
}

function toFeatureCollection(places: Place[]) {
  return {
    type: 'FeatureCollection' as const,
    features: places.map((place, index) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: place.coordinates },
      properties: { index, amenity: place.amenity },
    })),
  };
}

function colorExpression(): ExpressionSpecification {
  const pairs = Object.entries(AMENITY_COLORS).flat();
  return ['match', ['get', 'amenity'], ...pairs, OTHER_COLOR] as unknown as ExpressionSpecification;
}

function addPlacesLayer(map: MapLibreMap, places: Place[]): void {
  map.addSource(LAYER_ID, { type: 'geojson', data: toFeatureCollection(places) });
  map.addLayer({
    id: LAYER_ID,
    type: 'circle',
    source: LAYER_ID,
    paint: {
      'circle-color': colorExpression(),
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 15, 7],
      'circle-stroke-color': '#fffcf0',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 15, 1.5],
    },
  });
}

/** Shows only the places matching the form, via a layer filter (no re-upload). */
function applyFilters(map: MapLibreMap, places: Place[]): void {
  const filters = readFilters();
  const indices = places.flatMap((place, index) => (matches(place, filters) ? [index] : []));
  map.setFilter(LAYER_ID, ['in', ['get', 'index'], ['literal', indices]]);
  resultCount.textContent = tCount('result', indices.length);
}

function setField(name: string, html: string): void {
  const field = dialog.querySelector<HTMLElement>(`[data-field="${name}"]`)!;
  field.innerHTML = html;
  // Hide the whole <dt>/<dd> row when there's nothing to show.
  field.parentElement!.hidden = !html;
}

function openPlaceDialog(place: Place): void {
  dialog.querySelector('[data-field="name"]')!.textContent = place.name;
  setField('amenity', escapeHtml(amenityLabel(place.amenity)));
  setField('cuisines', escapeHtml(place.cuisines.map(prettify).join(', ')));
  setField('suburb', escapeHtml(place.suburb));
  setField('address', escapeHtml(place.address));
  setField('hours', place.hours ? hoursHtml(place) : '');
  setField(
    'phone',
    place.phone ? `<a href="tel:${escapeHtml(place.phone)}">${escapeHtml(place.phone)}</a>` : '',
  );
  setField(
    'website',
    /^https?:\/\//.test(place.website)
      ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">${escapeHtml(place.website)}</a>`
      : escapeHtml(place.website),
  );

  const osmLink = dialog.querySelector<HTMLAnchorElement>('[data-field="osm"]')!;
  const osmType = { n: 'node', w: 'way', r: 'relation' }[place.osmId[0]];
  osmLink.hidden = !osmType;
  osmLink.href = osmType ? `https://www.openstreetmap.org/${osmType}/${place.osmId.slice(1)}` : '';

  dialog.showModal();
}

function setAllCuisines(checked: boolean): void {
  form
    .querySelectorAll<HTMLInputElement>('[name="cuisine"]')
    .forEach((input) => (input.checked = checked));
  form.dispatchEvent(new Event('input'));
}

function setupMap(places: Place[]): void {
  setWorkerUrl(workerUrl);
  const map = new MapLibreMap({ container: 'map', style: STYLE_URL, center: RIO_CENTER, zoom: 10 });
  map.addControl(new NavigationControl({ showCompass: false }));

  map.on('load', () => {
    addPlacesLayer(map, places);
    applyFilters(map, places);
    let searchTimer: ReturnType<typeof setTimeout> | undefined;
    form.addEventListener('input', (event) => {
      clearTimeout(searchTimer);
      // Checkboxes apply at once; typing waits for a pause.
      if ((event.target as HTMLInputElement).name === 'q') {
        searchTimer = setTimeout(() => applyFilters(map, places), SEARCH_DEBOUNCE_MS);
      } else {
        applyFilters(map, places);
      }
    });
  });

  map.on('click', LAYER_ID, (event) => {
    const index = event.features?.[0]?.properties.index;
    if (typeof index === 'number') openPlaceDialog(places[index]);
  });
  map.on('mouseenter', LAYER_ID, () => (map.getCanvas().style.cursor = 'pointer'));
  map.on('mouseleave', LAYER_ID, () => (map.getCanvas().style.cursor = ''));
}

async function start(): Promise<void> {
  resultCount.textContent = t('result.loading');
  let places: Place[];
  try {
    places = await loadPlaces(DATA_URL);
  } catch (error) {
    console.error(error);
    resultCount.textContent = t('result.loadError');
    return;
  }

  fillCuisineOptions(places);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.querySelectorAll<HTMLButtonElement>('[data-cuisine-toggle]').forEach((button) => {
    button.addEventListener('click', () => setAllCuisines(button.dataset.cuisineToggle === 'all'));
  });
  // Close when clicking the backdrop (outside the dialog box).
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  setupMap(places);
}

if (!setupLocale()) void start();
