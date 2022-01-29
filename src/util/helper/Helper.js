import StringHelper from "./StringHelper.js";
import ArrayHelper from "./ArrayHelper.js";
import ObjectHelper from "./ObjectHelper.js";

class Helper {

    get String() {
        return StringHelper;
    }

    get Array() {
        return ArrayHelper;
    }

    get Object() {
        return ObjectHelper;
    }

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

}

export default new Helper;
