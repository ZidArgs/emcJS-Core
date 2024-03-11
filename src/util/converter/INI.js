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
                    throw new SyntaxError(`duplicate section in INI at line ${i + 1}:\n${line}`);
                }
                output[act] = output[act] || {};
                continue;
            }
            if (VALUE.test(line)) {
                const data = line.split("=");
                if (typeof output[act][data[0]] === "string") {
                    throw new SyntaxError(`duplicate key in INI at line ${i + 1}:\n${line}`);
                }
                output[act][data[0]] = data[1];
                continue;
            }
            throw new SyntaxError(`unexpected token in INI at line ${i + 1}:\n${line}`);
        }
        return output;
    }

    stringify(input) {
        if (typeof input !== "object" || Array.isArray(input)) {
            throw new TypeError("input has to be an object");
        }
        const lines = [];
        if ("" in input) {
            const group = input[""];
            for (const key in group) {
                if (key.includes("=")) {
                    throw new Error(`keys can not contain "=" [ "" -> "${key}" ]`);
                }
                const value = group[key];
                lines.push(`${key}=${value}`);
            }
            lines.push("");
        }
        for (const groupName in input) {
            if (groupName === "") {
                continue;
            }
            lines.push(`[${groupName}]`);
            const group = input[groupName];
            for (const key in group) {
                if (key.includes("=")) {
                    throw new Error(`keys can not contain "=" [ "${groupName}" -> "${key}" ]`);
                }
                const value = group[key];
                lines.push(`${key}=${value}`);
            }
            lines.push("");
        }
        return lines.join("\n");
    }

}

export default new INI();
