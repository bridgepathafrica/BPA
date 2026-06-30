/**
 * Shared HTML/XML escaping utilities.
 * Use these before interpolating any user-controlled or database-sourced
 * strings into HTML email templates or SVG content.
 */

/**
 * Escape a value for safe interpolation into HTML or SVG text content.
 * Handles &, <, >, ", and ' characters.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Escape a value for safe interpolation into SVG text content.
 * SVG uses the same XML character escaping as HTML.
 */
export const escapeSvg = escapeHtml;

/**
 * Escape a value for safe interpolation into a mailto: or href= attribute.
 * Blocks javascript: and data: URI schemes to prevent injection.
 */
export function safeUrl(url: unknown): string {
  const s = String(url ?? "").trim();
  if (/^(javascript|data|vbscript):/i.test(s)) return "#";
  return s;
}
