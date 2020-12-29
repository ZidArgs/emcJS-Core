const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const COMMENT = /^(?:!|#).*$/;

function processLine(line) {
    return line.trim()
        .replace(/\\ /g, "\\u0020")
        .replace(/\\=/g, "\\u003D")
        .replace(/\\:/g, "\\u003A")
        .replace(/"/g, "\\u0022")
        .split(/(=|:| )/);
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
            let [key, , ...value] = processLine(line);
            key = JSON.parse(`"${key}"`);
            value = JSON.parse(`"${value.join("")}"`);
            if (key) {
                if (typeof output[key] === "string") {
                    throw new SyntaxError(`Duplicate key in Properties at line ${i + 1}:\n${line}`);
                }
                output[key] = value;
                while (output[key].endsWith("\\")) {
                    output[key] += JSON.parse(`"${lines[++i].trim()}"`);
                }
                continue;
            }
            throw new SyntaxError(`Unexpected token in Properties at line ${i + 1}:\n${line}`);
        }
        return output;
    }

}

export default new Properties();
