import opening_hours from 'opening_hours';
import { locale } from './i18n';

export type Span = 'morning' | 'afternoon' | 'night';
export const SPANS: readonly Span[] = ['morning', 'afternoon', 'night'];

export type LngLat = [number, number];

export interface Place {
  /** OSM element id, e.g. "n299619458" (node) or "w123" (way). */
  osmId: string;
  name: string;
  amenity: string;
  cuisines: string[];
  suburb: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  spans: ReadonlySet<Span>;
  /** Accent-free, lower-case text the search box matches against. */
  searchText: string;
  coordinates: LngLat;
}

type Geometry =
  | { type: 'Point'; coordinates: LngLat }
  | { type: 'MultiPolygon'; coordinates: LngLat[][][] };

interface Feature {
  id?: string;
  geometry: Geometry | null;
  properties: Record<string, string | undefined>;
}

const HOUR_MS = 60 * 60 * 1000;
/** A fixed Monday, so spans don't depend on the day the page is opened. */
const REFERENCE_WEEK_START = new Date(2026, 0, 5);
const REFERENCE_WEEK_END = new Date(2026, 0, 12);

/** Lower-cases and strips accents, so "Café" matches "cafe". */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Morning 06–12, afternoon 12–18, night 18–06. */
function spanOfHour(hour: number): Span {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

/**
 * Spans in which a place is open at some point during the week. Values that
 * aren't valid OSM syntax (free text like "11 às 22 h") yield no spans.
 */
function spansFor(hours: string): Set<Span> {
  const spans = new Set<Span>();
  if (!hours) return spans;

  let intervals: [Date, Date, boolean, string | undefined][];
  try {
    intervals = new opening_hours(hours, null).getOpenIntervals(
      REFERENCE_WEEK_START,
      REFERENCE_WEEK_END,
    );
  } catch {
    return spans; // Unparseable value: shown as text, but not filterable.
  }

  for (const [from, to] of intervals) {
    // Visit each clock hour the interval touches.
    let time = from.getTime();
    while (time < to.getTime() && spans.size < SPANS.length) {
      const date = new Date(time);
      spans.add(spanOfHour(date.getHours()));
      date.setMinutes(0, 0, 0);
      time = date.getTime() + HOUR_MS;
    }
  }
  return spans;
}

/** The point itself, or the average vertex of a polygon's outer ring. */
function pinCoordinates(geometry: Geometry | null): LngLat | null {
  if (geometry?.type === 'Point') return geometry.coordinates;
  const ring = geometry?.type === 'MultiPolygon' ? geometry.coordinates[0]?.[0] : undefined;
  if (!ring?.length) return null;
  const sum = ring.reduce(([lng, lat], [x, y]) => [lng + x, lat + y], [0, 0]);
  return [sum[0] / ring.length, sum[1] / ring.length];
}

function toPlace({ id, geometry, properties }: Feature): Place | null {
  const name = properties.name?.trim();
  const coordinates = pinCoordinates(geometry);
  if (!name || !coordinates) return null;

  const amenity = properties.amenity ?? '';
  const cuisines = (properties.cuisine ?? '')
    .split(';')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const suburb = properties['addr:suburb'] ?? '';
  const hours = properties.opening_hours ?? '';

  const address = [properties['addr:street'], properties['addr:housenumber']]
    .filter(Boolean)
    .join(', ');

  return {
    osmId: id ?? '',
    name,
    amenity,
    cuisines,
    suburb,
    address,
    phone: properties.phone ?? '',
    website: properties.website ?? '',
    hours,
    spans: spansFor(hours),
    searchText: normalizeText([name, suburb, ...cuisines].join(' ')),
    coordinates,
  };
}

/** Fetches the GeoJSON and keeps only named places, sorted by name. */
export async function loadPlaces(url: string): Promise<Place[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  const { features } = (await response.json()) as { features: Feature[] };

  return features
    .map(toPlace)
    .filter((place): place is Place => place !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Every cuisine found in `places`, most common first. */
export function cuisinesByCount(places: Place[]): string[] {
  const counts = new Map<string, number>();
  for (const place of places) {
    for (const cuisine of place.cuisines) {
      counts.set(cuisine, (counts.get(cuisine) ?? 0) + 1);
    }
  }
  return [...counts]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, locale))
    .map(([cuisine]) => cuisine);
}
