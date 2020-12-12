const LNBR_SEQ = /(?:\r\n|\n|\r)/g;

class CSV {

    parse(input, split = ",") {
        return input.split(LNBR_SEQ).map(item => {
            const output = [];
            const entries = item.split(split);
            parseEntries:
            while (entries.length) {
                let act = entries.shift();
                if (!act.startsWith('"')) {
                    output.push(act);
                } else {
                    let buf = [act];
                    while (entries.length) {
                        act = entries.shift();
                        buf.push(act);
                        if (act.endsWith('"')) {
                            output.push(buf.join(",").replace(/^"|"$/g, '').replace(/""/g, '"'));
                            buf = [];
                            continue parseEntries;
                        }
                    }
                    output.push(buf.join(","));
                }
            }
            return output;
        })
    }

}

export default new CSV();
