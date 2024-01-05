const UNICODE_ESCAPE = /(\\)?\\u([0-9A-F]{4})/ig;

function unicodeEscapeReplaces(match, preEscapeSlash, unicodeValue) {
    if (preEscapeSlash) {
        return match.slice(1);
    }
    return String.fromCharCode(parseInt(unicodeValue, 16));
}

export function unicodeSlice(text, start, end) {
    return [...text].slice(start, end).join("");
}

export function unescapeUnicode(value) {
    return value.replace(UNICODE_ESCAPE, unicodeEscapeReplaces);
}
