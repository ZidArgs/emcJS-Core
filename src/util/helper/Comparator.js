import {isNull} from "./CheckType.js";
import {isClass} from "./Class.js";

const NUMBERED_STRING_REGEX = /(.*?)([0-9]*)$/;

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

export function numberedStringComparator(a, b) {
    if (a.localeCompare(b) === 0) {
        return 0;
    }
    const [
        , sA,
        nA
    ] = NUMBERED_STRING_REGEX.exec(a);
    const [
        , sB,
        nB
    ] = NUMBERED_STRING_REGEX.exec(b);
    const sCompare = sA.localeCompare(sB);
    if (sCompare === 0) {
        const iA = parseInt(nA);
        const iB = parseInt(nB);
        return iA - iB;
    }
    return sCompare;
}

export default class Comparator {

    #comparedDicts = new Map();

    #comparators = new Map();

    registerComparator(clazz, comparator) {
        if (typeof clazz !== "function" && !isClass(clazz)) {
            throw new TypeError("clazz must be a class or compositor.");
        }
        if (typeof comparator !== "function") {
            throw new TypeError("comparator must be a function.");
        }
        this.#comparators.set(clazz, comparator);
    }

    unregisterComparator(clazz) {
        this.#comparators.delete(clazz);
    }

    isEqual(a, b) {
        const result = this.#compare(a, b);
        this.#comparedDicts.clear();
        return result;
    }

    #compare(a, b) {
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

        // check html elements
        if (a instanceof HTMLElement) {
            if (b instanceof HTMLElement) {
                if (a.tagName !== b.tagName) {
                    return false;
                }
                if (a.attributes.length !== b.attributes.length) {
                    return false;
                }
                for (const attr of a.attributes) {
                    if (attr.value !== b.getAttribute(attr.name)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }

        // check arrays
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length != b.length) {
                return false;
            }
            return a.every((i, j) => this.isEqual(i, b[j]));
        }
        if (Array.isArray(b)) {
            return false;
        }

        // check dicts
        return this.#compareDicts(a, b);
    }

    #compareDicts(a, b) {
        const dictsA = this.#getOrcreateDictCache(a);
        if (dictsA.has(b)) {
            return true;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length != bKeys.length) {
            return false;
        }
        dictsA.add(b);
        return aKeys.every((i) => this.#compare(a[i], b[i]));
    }

    #getOrcreateDictCache(a) {
        if (this.#comparedDicts.has(a)) {
            return this.#comparedDicts.get(a);
        }
        const cache = new Set();
        this.#comparedDicts.set(a, cache);
        return cache;
    }

}

const defaultComparator = new Comparator();

export const registerComparator = defaultComparator.registerComparator.bind(defaultComparator);

export const unregisterComparator = defaultComparator.unregisterComparator.bind(defaultComparator);

export const isEqual = defaultComparator.isEqual.bind(defaultComparator);
