import {
    unescapeUnicode
} from "../helper/string/Unicode.js";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const COMMENT = /^(?:!|#).*$/;

function processLine(line) {
    const escaped = line.trim()
        .replace(/\\ /g, "\\u0020")
        .replace(/\\=/g, "\\u003D")
        .replace(/\\:/g, "\\u003A");
    const [, key = "", value = ""] = escaped.match(/(.*?)(?:=|:)(.*)/) ?? escaped.match(/(.*?)(?: )(.*)/) ?? [];
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
            const [key, value] = processLine(line);
            if (key) {
                if (typeof output[key] === "string") {
                    throw new SyntaxError(`Duplicate key in Properties at line ${i + 1}:\n${line}`);
                }
                output[key] = value;
                while (output[key].endsWith("\\")) {
                    output[key] = output[key].slice(0, -1).trim() + `\r\n${(lines[++i] ?? "").trim()}`;
                }
                continue;
            }
            throw new SyntaxError(`Unexpected token in Properties at line ${i + 1}:\n${line}`);
        }
        return output;
    }

}

export default new Properties();
