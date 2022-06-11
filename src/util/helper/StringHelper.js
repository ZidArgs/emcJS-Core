const TEMPLATE_PLACEHOLDER = /\$\{(.*?)\}/;
const UNICODE_ESCAPE = /(\\)?\\u([0-9A-F]{4})/ig;

function unicodeEscapeReaplaces(match, preEscapeSlash, unicodeValue) {
    if (preEscapeSlash) {
        return match.slice(1);
    }
    return String.fromCharCode(parseInt(unicodeValue, 16));
}

class StringHelper {

    applyTemplate(text, values) {
        let match;
        while ((match = TEMPLATE_PLACEHOLDER.exec(text)) != null) {
            const substitute = values[match[1]] || "";
            text = text.replace(match[0], substitute);
        }
        return text;
    }

    unicodeSlice(text, start, end) {
        return [...text].slice(start, end).join("");
    }

    unescapeUnicode(value) {
        return value.replace(UNICODE_ESCAPE, unicodeEscapeReaplaces);
    }

}

export default new StringHelper;
