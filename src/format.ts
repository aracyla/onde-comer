import { hasKey, t } from './i18n';
import { SPANS, type Place } from './places';

/** Escapes text for safe use inside HTML markup and attribute values. */
export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** OSM values like "steak_house" → "steak house". */
export const prettify = (value: string): string => value.replace(/_/g, ' ');

/** Translated label for an OSM amenity, or the prettified raw value. */
export function amenityLabel(amenity: string): string {
  const key = `amenity.${amenity}`;
  return hasKey(key) ? t(key) : prettify(amenity);
}

/** Opening hours text followed by a badge per span, or "—" when unknown. */
export function hoursHtml(place: Place): string {
  if (!place.hours) return '—';
  const badges = SPANS.filter((span) => place.spans.has(span))
    .map((span) => `<span class="badge">${t(`span.${span}`)}</span>`)
    .join('');
  return `<span class="hours-text">${escapeHtml(place.hours)}</span>${badges}`;
}
