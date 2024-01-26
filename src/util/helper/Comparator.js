import {
    isNull
} from "./CheckType.js";

const NUMBERED_STRING_REGEX = /(.*?)([0-9]*)$/;

export function isJSON(input) {
    try {
        JSON.parse(input);
    } catch {
        return false;
    }
    return true;
}

export function compareVersions(a = "", b = "", s = ".") {
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

export function isEqual(a, b) {
    if (isNull(a) && isNull(b)) {
        return true;
    }
    if (Object.is(a, b)) {
        return true;
    }
    if (isNull(a) || isNull(b)) {
        return false;
    }
    if (typeof a.equals === "function") {
        return a.equals(b);
    }
    if (typeof b.equals === "function") {
        return b.equals(a);
    }
    if (typeof a != "object" || !(a instanceof b.constructor || b instanceof a.constructor)) {
        return false;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() == b.getTime();
    }
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length != b.length) {
            return false;
        }
        return a.every((i, j) => isEqual(i, b[j]));
    }
    if (Array.isArray(b)) {
        return false;
    }
    const c = Object.keys(a);
    if (c.length != Object.keys(b).length) {
        return false;
    }
    return c.every((i) => isEqual(a[i], b[i]));
}

export function numberedStringComparator(a, b) {
    if (a.localeCompare(b) === 0) {
        return 0;
    }
    const [, sA, nA] = NUMBERED_STRING_REGEX.exec(a);
    const [, sB, nB] = NUMBERED_STRING_REGEX.exec(b);
    const sCompare = sA.localeCompare(sB);
    if (sCompare === 0) {
        const iA = parseInt(nA);
        const iB = parseInt(nB);
        return iA - iB;
    }
    return sCompare;
}

export default class Comparator {

    #comparators = new Map();

    registerComparator(clazz, comparator) {
        if (typeof clazz !== "function" || clazz.prototype == null) {
            throw new TypeError("clazz must be a class or compositor.")
        }
        if (typeof comparator !== "function") {
            throw new TypeError("comparator must be a function.")
        }
        this.#comparators.set(clazz, comparator);
    }

    isEqual(a, b) {
        if (isNull(a) && isNull(b)) {
            return true;
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (isNull(a) || isNull(b)) {
            return false;
        }
        if (typeof a.equals === "function") {
            return a.equals(b);
        }
        if (typeof b.equals === "function") {
            return b.equals(a);
        }
        if (typeof a != "object" || !(a instanceof b.constructor || b instanceof a.constructor)) {
            return false;
        }

        // check for registered comparators or equals function
        if (b instanceof a.constructor) {
            if (this.#comparators.has(a.constructor)) {
                const comparator = this.#comparators.get(a.constructor);
                return comparator(a, b);
            }
            if (typeof a.equals === "function") {
                return a.equals(b);
            }
        }
        if (a instanceof b.constructor) {
            if (this.#comparators.has(b.constructor)) {
                const comparator = this.#comparators.get(b.constructor);
                return comparator(b, a);
            }
            if (typeof b.equals === "function") {
                return b.equals(a);
            }
        }

        // check dates
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }

        // check arrays
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length != b.length) {
                return false;
            }
            return a.every((i, j) => isEqual(i, b[j]));
        }
        if (Array.isArray(b)) {
            return false;
        }

        // check dicts
        const c = Object.keys(a);
        if (c.length != Object.keys(b).length) {
            return false;
        }
        return c.every((i) => isEqual(a[i], b[i]));
    }

}
