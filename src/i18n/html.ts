import { ptBR } from './pt-br.ts';
import { en } from './en.ts';
import type { Dictionary } from './index.ts';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Writes translated text into an HTML page at build/dev time, so every page
 * ships with real text for search engines. The page locale comes from
 * `<html lang>`; pt-BR is the default.
 * - `data-i18n="key">…<`          → element text
 * - `data-i18n-placeholder="key"` → placeholder attribute
 * - `data-i18n-content="key"`     → content attribute (meta tags)
 */
export function localizeHtml(html: string): string {
  const dictionary: Dictionary = /<html[^>]*\slang="en"/.test(html) ? en : ptBR;
  const lookup = (key: string): string => {
    if (!(key in dictionary)) throw new Error(`Unknown i18n key "${key}"`);
    return escapeHtml(dictionary[key as keyof Dictionary]);
  };

  return html
    .replace(
      /(data-i18n="([\w.]+)"[^>]*>)[^<]*/g,
      (_, open: string, key: string) => open + lookup(key),
    )
    .replace(
      /data-i18n-(placeholder|content)="([\w.]+)"/g,
      (_, attr: string, key: string) =>
        `data-i18n-${attr}="${key}" ${attr}="${lookup(key)}"`,
    );
}
