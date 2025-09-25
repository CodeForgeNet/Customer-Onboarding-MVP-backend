/**
 * Simple sanitization function to prevent XSS attacks by encoding HTML entities
 */
export function sanitize(value: string): string {
  if (!value) return value;

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
