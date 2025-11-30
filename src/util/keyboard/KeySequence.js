const VALUE_PARSE = /(ctrl\s+)?(shift\s+)?(alt\s+)?(meta\s+)?(.+)?/i;

const KeySequence = {

    parse(string) {
        const res = VALUE_PARSE.exec(string ?? "");
        return {
            ctrlKey: res[1] != null,
            shiftKey: res[2] != null,
            altKey: res[3] != null,
            metaKey: res[4] != null,
            key: res[5]?.toLowerCase() === "space" ? " " : res[5] ?? null
        };
    },

    stringify(opts = {}) {
        const {
            ctrlKey, shiftKey, altKey, metaKey, key
        } = opts;
        let res = "";
        if (ctrlKey) {
            res += "ctrl ";
        }
        if (shiftKey) {
            res += "shift ";
        }
        if (altKey) {
            res += "alt ";
        }
        if (metaKey) {
            res += "meta ";
        }
        if (key != null) {
            res += key === " " ? "space" : key.toLowerCase();
        }
        return res;
    }

};

export default Object.freeze(KeySequence);
