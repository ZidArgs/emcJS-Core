const LNBR_SEQ = /(?:\r\n|\n|\r)/g;

class CSV {

    parse(input, split = ",") {
        return input.split(LNBR_SEQ).map((item) => {
            const output = [];
            const entries = item.split(split);
            parseEntries:
            while (entries.length) {
                let act = entries.shift();
                if (!act.startsWith("\"")) {
                    output.push(act);
                } else {
                    let buf = [act];
                    while (entries.length) {
                        act = entries.shift();
                        buf.push(act);
                        if (act.endsWith("\"")) {
                            output.push(buf.join(",").replace(/^"|"$/g, "").replace(/""/g, "\""));
                            buf = [];
                            continue parseEntries;
                        }
                    }
                    output.push(buf.join(","));
                }
            }
            return output;
        });
    }

    stringify(input, split = ",") {
        if (!Array.isArray(input)) {
            throw new TypeError("input has to be an array");
        }
        const lines = [];
        for (const index in input) {
            const row = input[index];
            if (!Array.isArray(row)) {
                throw new TypeError(`row is not an array at index [ ${index} ]`);
            }
            lines.push(row.map((value) => {
                value = value.replace(/"/g, "\"\"");
                return value.includes(split) ? `"${value}"` : value;
            }).join(split));
        }
        return lines.join("\n");
    }

}

export default new CSV();
