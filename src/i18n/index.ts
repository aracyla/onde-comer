import { ptBR } from './pt-br.ts';
import { en } from './en.ts';

type MessageKey = keyof typeof ptBR;
export type Dictionary = Record<MessageKey, string>;
type Locale = 'pt-BR' | 'en';

const DICTIONARIES: Record<Locale, Dictionary> = { 'pt-BR': ptBR, en };

/** URL segment each locale lives under, relative to the site base. */
const LOCALE_PREFIX: Record<Locale, string> = { 'pt-BR': '', en: 'en/' };

const STORAGE_KEY = 'onde-comer:locale';
const BASE_URL = import.meta.env.BASE_URL;

/** The page's locale, taken from `<html lang>` (each locale has its own HTML file). */
export const locale: Locale =
  document.documentElement.lang === 'en' ? 'en' : 'pt-BR';

const pluralRules = new Intl.PluralRules(locale);
const numberFormat = new Intl.NumberFormat(locale);

/** Translates `key`, replacing `{name}` placeholders with `params`. */
export function t(
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  return DICTIONARIES[locale][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(params[name] ?? ''),
  );
}

/** Whether `key` exists in the dictionary (for keys built from data). */
export function hasKey(key: string): key is MessageKey {
  return key in DICTIONARIES[locale];
}

/** Picks `<prefix>.one` / `<prefix>.other` by plural rules and formats the count. */
export function tCount(prefix: 'result', count: number): string {
  const form = pluralRules.select(count) === 'one' ? 'one' : 'other';
  return t(`${prefix}.${form}`, { count: numberFormat.format(count) });
}

/**
 * URL of the current page in `target` locale: `/base/` ↔ `/base/en/`.
 */
function localeUrl(target: Locale, { pathname, search } = location): string {
  const path = pathname.startsWith(BASE_URL)
    ? pathname.slice(BASE_URL.length)
    : pathname.replace(/^\//, '');
  const page = path.replace(/^en(\/|$)/, '');
  return `${BASE_URL}${LOCALE_PREFIX[target]}${page}${search}`;
}

function readStoredLocale(): Locale | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'en' || value === 'pt-BR' ? value : null;
  } catch {
    return null; // Storage blocked (private mode): fall back to browser language.
  }
}

function storeLocale(value: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice just isn't remembered.
  }
}

/**
 * Redirects first-time English-speaking visitors to the English URL and wires
 * the `[data-locale-switch]` links. Returns true when a redirect was started.
 */
export function setupLocale(): boolean {
  const prefersEnglish = navigator.language.toLowerCase().startsWith('en');
  if (locale === 'pt-BR' && prefersEnglish && readStoredLocale() === null) {
    location.replace(localeUrl('en'));
    return true;
  }

  const other: Locale = locale === 'en' ? 'pt-BR' : 'en';
  document
    .querySelectorAll<HTMLAnchorElement>('[data-locale-switch]')
    .forEach((link) => {
      link.href = localeUrl(other);
      link.addEventListener('click', () => storeLocale(other));
    });
  return false;
}
