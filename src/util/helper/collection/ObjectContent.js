export function sortObject(src, fn = () => true) {
    if (typeof src != "object") {
        throw new TypeError("only objects can be sorted");
    }
    if (typeof fn != "function") {
        fn = () => true;
    }
    const keys = Object.keys(src);
    const filtered = keys.sort((key) => fn(key, src[key]));
    const result = filtered.reduce((res, key) => (res[key] = src[key], res), {});
    return result;
}

export function filterObject(src = {}, fn = () => true) {
    if (typeof src != "object") {
        throw new TypeError("only objects can be filtered");
    }
    if (typeof fn != "function") {
        fn = () => true;
    }
    const keys = Object.keys(src);
    const filtered = keys.filter((key) => fn(key, src[key]));
    const result = filtered.reduce((res, key) => (res[key] = src[key], res), {});
    return result;
}

export function getObjectKeysByValue(obj, value) {
    return Object.keys(obj).filter((key) => obj[key] === value);
}

export function renameObjectKeys(src = {}, prefix = "", postfix = "") {
    const res = {};
    for (const [key, value] of Object.entries(src)) {
        res[`${prefix}${key}${postfix}`] = value;
    }
    return res;
}

export function getFromObjectByPath(obj, path) {
    if (typeof obj !== "object") {
        throw new TypeError("first parameter must be an object");
    }
    if (!Array.isArray(path)) {
        throw new TypeError("second parameter must be an array");
    }
    path = Array.from(path);
    while (obj != null && path.length) {
        obj = obj[path.shift()];
    }
    return obj;
}

export function flattenObject(obj, splitter = ".", res = {}) {
    if (typeof obj !== "object") {
        return obj;
    }
    for (const key in obj) {
        const value = obj[key];
        if (typeof value == "object") {
            const flatObj = flattenObject(value);
            for (const flatKey in flatObj) {
                res[`${key}${splitter}${flatKey}`] = flatObj[flatKey];
            }
        } else {
            res[key] = value;
        }
    }
    return res;
}

export function elevateObject(obj, splitter = ".", res = {}) {
    if (typeof obj !== "object") {
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
