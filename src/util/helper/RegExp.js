const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;

export function escapeRegExp(string) {
    return string.replace(ESCAPE_REGEXP, "\\$&");
}
