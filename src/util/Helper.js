


class Helper {

    randomInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
        max -= min;
        return parseInt(Math.random() * (max + 1)) + min;
    }

    compareVersions(a = "", b = "", s = ".") {
        const c = a.split(s);
        const d = b.split(s);
        let e = parseInt(c.shift());
        let f = parseInt(d.shift());
        while (!!e && !!f) {
            if (e != f) {
                return e < f;
            }
            e = parseInt(c.shift());
            f = parseInt(d.shift());
        }
        return !!f;
    }

    arrayDiff(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        const c = new Set(b);
        return a.filter(d => !c.has(d));
    }
      
    arraySymDiff(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        return this.arrayDiff(a, b).concat(this.arrayDiff(b, a));
    }
    
    arrayIntersect(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        const c = new Set(b);
        return a.filter(d => c.has(d));
    }
    
    objectSort(a, b) {
        if (typeof a != "object" || Array.isArray(a)) {
            throw new TypeError("only objects are sortable");
        }
        if (typeof b != "function") {
            b = undefined;
        }
        const c = {};
        const d = Object.keys(a).sort(b);
        for (const e of d) {
            c[e] = a[e];
        }
        return c;
    }
    
    isEqual(a, b) {
        if (Object.is(a, b)) {
            return true;
        }
        if (typeof a != "object") {
            return false;
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() == b.getTime();
        }
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length != b.length) {
                return false;
            }
            return a.every((i, j) => this.isEqual(i, b[j]));
        }
        if (Array.isArray(b)) {
            return false;
        }
        const c = Object.keys(a);
        if (c.length != Object.keys(b).length) {
            return false;
        }
        return c.every(i => b[i] != null && this.isEqual(a[i], b[i]));
    }

    deepClone(item) {
        if (item != null && typeof item == "object") {
            if (item instanceof HTMLElement) {
                return item.cloneNode(true);
            }
            if (item instanceof Date) {
                return new Date(item);
            }
            if (item instanceof Boolean) {
                return Boolean(item);
            }
            if (item instanceof Number) {
                return Number(item);
            }
            if (item instanceof String) {
                return String(item);
            }
            if (Array.isArray(item)) {
                return item.map(el => this.deepClone(el));
            }
            const result = {};
            for (const i in item) {
                result[i] = this.deepClone(item[i]);
            }
            return result;
        }
        return item;
    }

    flatten(obj, splitter = ".", res = {}) {
        if (typeof obj != "object") {
            return obj;
        }
        for (const key in obj) {
            const value = obj[key];
            if (typeof value == "object") {
                const flatObj = this.flattenObject(value);
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

export default new Helper;
