import {
    unescapeUnicode
} from "../helper/string/Unicode.js";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const META_SEQUENCE = /#\s*@([^\s]+)\s*(.+)\s*/;
const COMMENT = /^(?:#).*$/;

const ESCAPE_PATTERN_0 = /\\=/g;
const ESCAPE_PATTERN_1 = /\\\\/g;
const ESCAPE_PATTERN_2 = /\\n/g;
const ESCAPE_PATTERN_3 = /\\r/g;
const UNESCAPE_PATTERN_0 = /=/g;
const UNESCAPE_PATTERN_1 = /\\/g;
const UNESCAPE_PATTERN_2 = /\n/g;
const UNESCAPE_PATTERN_3 = /\r/g;
const VALUE_PATTERN = /(.*?)(?:=)(.*)/;

function processLine(line) {
    const escaped = line.trim()
        .replace(ESCAPE_PATTERN_0, "\\u003D")
        .replace(ESCAPE_PATTERN_1, "\\u005C")
        .replace(ESCAPE_PATTERN_2, "\n")
        .replace(ESCAPE_PATTERN_3, "\r");
    const result = escaped.match(VALUE_PATTERN) ?? [];
    if (result == null) {
        return null;
    }
    const [, key = "", value = ""] = result;
    return [unescapeUnicode(key.trim()), unescapeUnicode(value.trim())];
}

function processToken(token) {
    return token.trim()
        .replace(UNESCAPE_PATTERN_0, "\\=")
        .replace(UNESCAPE_PATTERN_1, "\\\\")
        .replace(UNESCAPE_PATTERN_2, "\\n")
        .replace(UNESCAPE_PATTERN_3, "\\r");
}

class Lang {

    parse(input) {
        const output = {};
        const lines = input.split(LNBR_SEQ);
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            if (!line.length) {
                continue;
            }
            const metaRes = line.match(META_SEQUENCE);
            if (metaRes != null) {
                const [, key, value] = metaRes;
                output[`@${key}`] = value;
                continue;
            }
            if (COMMENT.test(line)) {
                continue;
            }
            const lineRes = processLine(line);
            if (lineRes != null) {
                const [key, value] = lineRes;
                if (!key) {
                    throw new SyntaxError(`key can not be empty in LANG at line ${i + 1}:\n${line}`);
                }
                if (key.startsWith("@")) {
                    throw new SyntaxError(`key can not start with @ in LANG at line ${i + 1}:\n${line}`);
                }
                if (typeof output[key] === "string") {
                    throw new SyntaxError(`duplicate key in LANG at line ${i + 1}:\n${line}`);
                }
                output[key] = value;
                continue;
            }
            throw new SyntaxError(`unexpected token in LANG at line ${i + 1}:\n${line}`);
        }
        return output;
    }

    stringify(input) {
        if (typeof input !== "object" || Array.isArray(input)) {
            throw new TypeError("input has to be an object");
        }
        const metaLines = [];
        const lines = [];
        for (const key in input) {
            const value = input[key];
            if (key.startsWith("@")) {
                metaLines.push(`# @${key.slice(1)} ${value}`);
            } else {
                lines.push(`${processToken(key)}=${processToken(value)}`);
            }
        }
        return [
            ...metaLines,
            ...lines
        ].join("\n");
    }

}

export default new Lang();
