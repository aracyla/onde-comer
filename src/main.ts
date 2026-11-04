import './assets/styles/styles.css';
import { hasKey, locale, setupLocale, t, tCount } from './i18n';
import { loadPlaces, normalizeText, SPANS, type Place, type Span } from './places';

const DATA_URL = `${import.meta.env.BASE_URL}rio-food.geojson`;

const form = document.querySelector<HTMLFormElement>('#filters')!;
const cuisineSelect = form.querySelector<HTMLSelectElement>('[name="cuisine"]')!;
const resultCount = document.querySelector<HTMLElement>('#result-count')!;
const hoursNote = document.querySelector<HTMLElement>('#hours-note')!;
const tableBody = document.querySelector<HTMLTableSectionElement>('#places-body')!;

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** OSM values like "steak_house" → "steak house". */
const prettify = (value: string): string => value.replace(/_/g, ' ');

function amenityLabel(amenity: string): string {
  const key = `amenity.${amenity}`;
  return hasKey(key) ? t(key) : prettify(amenity);
}

/** Cuisine options, most common first. */
function fillCuisineOptions(places: Place[]): void {
  const counts = new Map<string, number>();
  for (const place of places) {
    for (const cuisine of place.cuisines) {
      counts.set(cuisine, (counts.get(cuisine) ?? 0) + 1);
    }
  }
  const options = [...counts]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, locale))
    .map(([cuisine]) => new Option(prettify(cuisine), cuisine));
  cuisineSelect.append(...options);
}

interface Filters {
  query: string;
  amenity: string;
  cuisine: string;
  spans: Span[];
}

function readFilters(): Filters {
  const data = new FormData(form);
  return {
    query: normalizeText(String(data.get('q') ?? '').trim()),
    amenity: String(data.get('amenity') ?? ''),
    cuisine: String(data.get('cuisine') ?? ''),
    spans: data.getAll('span').map(String) as Span[],
  };
}

/** Filters combine with AND; checked spans combine with OR. */
function matches(place: Place, { query, amenity, cuisine, spans }: Filters): boolean {
  return (
    (!query || place.searchText.includes(query)) &&
    (!amenity || place.amenity === amenity) &&
    (!cuisine || place.cuisines.includes(cuisine)) &&
    (spans.length === 0 || spans.some((span) => place.spans.has(span)))
  );
}

function rowHtml(place: Place): string {
  const badges = SPANS.filter((span) => place.spans.has(span))
    .map((span) => `<span class="badge">${t(`span.${span}`)}</span>`)
    .join('');
  const hours = place.hours
    ? `<span class="hours-text">${escapeHtml(place.hours)}</span>${badges}`
    : '—';

  return `<tr>
    <td>${escapeHtml(place.name)}</td>
    <td>${escapeHtml(amenityLabel(place.amenity))}</td>
    <td>${escapeHtml(place.cuisines.map(prettify).join(', ')) || '—'}</td>
    <td>${escapeHtml(place.suburb) || '—'}</td>
    <td class="hours-cell">${hours}</td>
  </tr>`;
}

function render(places: Place[]): void {
  const filters = readFilters();
  const visible = places.filter((place) => matches(place, filters));

  resultCount.textContent = tCount('result', visible.length);
  hoursNote.hidden = filters.spans.length === 0;
  tableBody.innerHTML = visible.length
    ? visible.map(rowHtml).join('')
    : `<tr><td colspan="5" class="table-empty">${t('result.empty')}</td></tr>`;
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
  form.addEventListener('input', () => render(places));
  render(places);
}

if (!setupLocale()) void start();
