import {unescapeUnicode} from "../helper/string/Unicode.js";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const COMMENT = /^(?:!|#).*$/;

const ESCAPE_PATTERN_0 = /\\ /g;
const ESCAPE_PATTERN_1 = /\\=/g;
const ESCAPE_PATTERN_2 = /\\:/g;
const VALUE_PATTERN_0 = /(.*?)(?:=|:)(.*)/;
const VALUE_PATTERN_1 = /(.*?)(?: |\t|\f)(.*)/;
const MULTILINE_PATTERN = /(?:^\\|[^\\](?:\\\\)*\\)$/;

function processLine(line) {
    const escaped = line.trim()
        .replace(ESCAPE_PATTERN_0, "\\u0020")
        .replace(ESCAPE_PATTERN_1, "\\u003D")
        .replace(ESCAPE_PATTERN_2, "\\u003A");
    const result = escaped.match(VALUE_PATTERN_0) ?? escaped.match(VALUE_PATTERN_1) ?? [];
    if (result == null) {
        return null;
    }
    const [
        , key = "",
        value = ""
    ] = result;
    return [unescapeUnicode(key.trim()), unescapeUnicode(value.trim())];
}

class Properties {

    parse(input) {
        const output = {};
        const lines = input.split(LNBR_SEQ);
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            if (!line.length || COMMENT.test(line)) {
                continue;
            }
            const lineRes = processLine(line);
            if (lineRes != null) {
                const [key, value] = lineRes;
                if (key === "__proto__" || key === "constructor" || key === "prototype") {
                    continue;
                }
                if (typeof output[key] === "string") {
                    throw new SyntaxError(`duplicate key in PROPERTIES at line ${i + 1}:\n${line}`);
                }
                output[key] = value;
                while (MULTILINE_PATTERN.test(output[key])) {
                    output[key] = output[key].slice(0, -1).trim() + `\r\n${(lines[++i] ?? "").trim()}`.replace(/\\\\/g, "\\");
                }
                continue;
            }
            throw new SyntaxError(`unexpected token in PROPERTIES at line ${i + 1}:\n${line}`);
        }
        return output;
    }

}

export default new Properties();
