/**
 * Escape a string for safe insertion into HTML (text content or attributes).
 *
 * Booking UIs build markup with `innerHTML` templates. Guest-controlled fields
 * (names, notes, phone, email, etc.) sync from the server into local SQLite —
 * without escaping, a malicious booking is stored XSS that runs on staff devices
 * and can read sessions from localStorage. Also escape `"` so values used in
 * attributes (e.g. href="tel:…") cannot break out of the attribute.
 */
export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
