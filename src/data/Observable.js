import EventTargetManager from "../util/event/EventTargetManager.js";
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
        if (typeof property === "symbol" || BYPASS_PROPERTIES.includes(property)) {
            return false;
        }
        target.set(property, value);
        return true;
    },
    get(target, property) {
        if (typeof property === "symbol" || BYPASS_PROPERTIES.includes(property)) {
            return target[property]?.bind(target);
        }
        return target.get(property);
    },
    deleteProperty(target, property) {
        if (typeof property === "symbol" || BYPASS_PROPERTIES.includes(property)) {
            return false;
        }
        target.remove(property);
        return true;
    },
    ownKeys(target) {
        return target.keys();
    },
    setPrototypeOf() {
        return false;
    }
};

/**
 * Observable component throws change events whenever its contained data changes
 */
export default class Observable extends EventTarget {

    #buffer = new Map();

    #eventManagers = new Map();

    /**
     * Create an observed Object utilizing Proxy
     * @param {Object} data an object to observe, primitives can not be observed
     */
    constructor(data) {
        if (data == null) {
            data = {};
        } else if (typeof data !== "object") {
            throw new TypeError("object expected");
        }
        super();
        // ---
        for (const key in data) {
            const value = this.#observe(key, data[key]);
            this.#buffer.set(key, value);
        }
        return new Proxy(this, HANDLER);
    }

    #getEventManager(key) {
        if (this.#eventManagers.has(key)) {
            return this.#eventManagers.get(key);
        }
        const manager = new EventTargetManager();
        manager.set("change", () => {
            const ev = new Event("change");
            ev.key = key;
            ev.value = this.get(key);
            this.dispatchEvent(ev);
        });
        this.#eventManagers.set(key, manager);
        return manager;
    }

    #observe(key, data) {
        if (typeof data === "object") {
            if (!(data instanceof Observable)) {
                data = new Observable(data);
            }
            const eventManager = this.#getEventManager(key);
            eventManager.switchTarget(data);
            return data;
        }
        return data;
    }

    #unobserve(key, data) {
        if (typeof data === "object") {
            const eventManager = this.#getEventManager(key);
            eventManager.switchTarget(null);
        }
    }

    set(key, value) {
        const old = this.#buffer.get(key);
        if (!Helper.isEqual(old, value)) {
            value = this.#observe(key, value);
            this.#buffer.set(key, value);
            // ---
            const ev = new Event("change");
            ev.key = key;
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get(key) {
        return this.#buffer.get(key);
    }

    remove(key) {
        const old = this.#buffer.get(key);
        this.#unobserve(key, old);
    }

    keys() {
        return Array.from(this.#buffer.keys());
    }

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]()
    }

}
