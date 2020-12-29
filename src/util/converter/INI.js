const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const GROUP = /^\[(.+)\]$/;
const VALUE = /^[^=]+=.*$/;
const COMMENT = /^;.*$/;

class INI {

    parse(input) {
        const output = {"":{}};
        let act = "";
        const lines = input.split(LNBR_SEQ);
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            if (!line.length || COMMENT.test(line)) {
                continue;
            }
            if (GROUP.test(line)) {
                act = line.slice(1, -1);
                if (output[act] != null) {
                    throw new SyntaxError(`Duplicate section in INI at line ${i + 1}:\n${line}`);
                }
                output[act] = output[act] || {};
                continue;
            }
            if (VALUE.test(line)) {
                const data = line.split("=");
                if (typeof output[act][data[0]] === "string") {
                    throw new SyntaxError(`Duplicate key in INI at line ${i + 1}:\n${line}`);
                }
                output[act][data[0]] = data[1];
                continue;
            }
            throw new SyntaxError(`Unexpected token in INI at line ${i + 1}:\n${line}`);
        }
        return output;
    }

}

export default new INI();
