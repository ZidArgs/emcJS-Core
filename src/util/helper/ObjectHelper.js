class ObjectHelper {

    sort(src, fn = () => true) {
        if (typeof src != "object") {
            throw new TypeError("only objects are sortable");
        }
        if (typeof fn != "function") {
            fn = () => true;
        }
        const keys = Object.keys(src);
        const filtered = keys.sort((key) => fn(key, src[key]));
        const result = filtered.reduce((res, key) => (res[key] = src[key], res), {});
        return result;
    }

    filter(src = {}, fn = () => true) {
        if (typeof src != "object") {
            throw new TypeError("only objects are sortable");
        }
        if (typeof fn != "function") {
            fn = () => true;
        }
        const keys = Object.keys(src);
        const filtered = keys.filter((key) => fn(key, src[key]));
        const result = filtered.reduce((res, key) => (res[key] = src[key], res), {});
        return result;
    }

    getKeysByValue(obj, value) {
        return Object.keys(obj).filter((key) => obj[key] === value);
    }

    renameKeys(src = {}, prefix = "", postfix = "") {
        const res = {};
        for (const [key, value] of Object.entries(src)) {
            res[`${prefix}${key}${postfix}`] = value;
        }
        return res;
    }

    flatten(obj, splitter = ".", res = {}) {
        if (typeof obj != "object") {
            return obj;
        }
        for (const key in obj) {
            const value = obj[key];
            if (typeof value == "object") {
                const flatObj = this.flatten(value);
                for (const flatKey in flatObj) {
                    res[`${key}${splitter}${flatKey}`] = flatObj[flatKey];
                }
            } else {
                res[key] = value;
            }
        }
        return res;
    }

    elevate(obj, splitter = ".", res = {}) {
        if (typeof obj != "object") {
            return obj;
        }
        for (const key in obj) {
            const value = obj[key];
            const path = key.split(splitter);
            let current = res;
            while (path.length > 1) {
                const iKey = path.shift();
                if (iKey) {
                    if (current[iKey] == null) {
                        current[iKey] = {};
                    }
                    current = current[iKey];
                }
            }
            current[path.shift()] = value;
        }
        return res;
    }

}

export default new ObjectHelper;
