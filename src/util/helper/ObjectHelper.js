class ObjectHelper {

    isPropertyWritable(obj, name) {
        if (typeof obj !== "object") {
            throw new TypeError("first parameter must be an object");
        }
        if (typeof name !== "string") {
            throw new TypeError("second parameter must be a string");
        }
        const desc = Object.getOwnPropertyDescriptor(obj.constructor.prototype, name);
        return desc == null || desc.writable || desc.set != null;
    }

    isPropertyReadable(obj, name) {
        if (typeof obj !== "object") {
            throw new TypeError("first parameter must be an object");
        }
        if (typeof name !== "string") {
            throw new TypeError("second parameter must be a string");
        }
        const desc = Object.getOwnPropertyDescriptor(obj.constructor.prototype, name);
        return desc == null || desc.readable || desc.get != null;
    }

    sort(src, fn = () => true) {
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

    filter(src = {}, fn = () => true) {
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

    #writeRecursive(target, key, value) {
        const oldValue = target[key];
        if (typeof oldValue === "object" && typeof value === "object") {
            for (const bKey in value) {
                const bValue = value[bKey];
                this.#writeRecursive(oldValue, bKey, bValue);
            }
        } else {
            target[key] = value;
        }
    }

    mergeInto(target, source) {
        if (typeof target !== "object") {
            throw new TypeError("first parameter must be an object");
        }
        if (typeof source !== "object") {
            throw new TypeError("second parameter must be an object");
        }
        for (const key in source) {
            const value = source[key];
            this.#writeRecursive(target, key, value);
        }
        return target;
    }

}

export default new ObjectHelper;
