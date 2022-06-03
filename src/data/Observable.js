import Helper from "../util/helper/Helper.js";

const BYPASS_PROPERTIES = [
    // Object
    "constructor",
    "__defineGetter__",
    "__defineSetter__",
    "hasOwnProperty",
    "__lookupGetter__",
    "__lookupSetter__",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toString",
    "valueOf",
    "__proto__",
    "toLocaleString",
    // EventTarget
    "addEventListener",
    "removeEventListener",
    "dispatchEvent"
];

const HANDLER = {
    set(target, property, value) {
        if (BYPASS_PROPERTIES.includes(property)) {
            return false;
        }
        target.set(property, value);
        return true;
    },
    get(target, property) {
        if (BYPASS_PROPERTIES.includes(property)) {
            return target[property]?.bind(target);
        }
        return target.get(property);
    }
};

class Observable extends EventTarget {

    #buffer = new Map();

    constructor(values) {
        if (values == null) {
            super();
        } else if (typeof values !== "object") {
            throw new TypeError("object expected");
        } else {
            super();
            // ---
            for (const key in values) {
                const value = values[key];
                this.#buffer.set(key, value);
            }
        }
    }

    set(key, value) {
        const old = this.#buffer.get(key);
        if (!Helper.isEqual(old, value)) {
            this.#buffer.set(key, value);
            const ev = new Event(key);
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get(key) {
        return this.#buffer.get(key);
    }

}

/**
 * Create an observed Object utilizing Proxy
 * @param {Object} data an object to observe, primitives can not be observed
 * @returns {Proxy} the Proxy observing the data
 */
export function observe(data) {
    if (typeof data === "object") {
        return new Proxy(new Observable(data), HANDLER);
    }
    return data;
}
