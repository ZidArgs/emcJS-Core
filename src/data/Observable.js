import {
    debounceCacheData
} from "../util/Debouncer.js";
import EventTargetManager from "../util/event/EventTargetManager.js";
import {
    mergeObjectsInto
} from "../util/helper/collection/MergeObjects.js";
import {
    isEqual
} from "../util/helper/Comparator.js";

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
    "dispatchEvent",
    // internal
    "toJSON",
    "set",
    "get",
    "delete",
    "keys"
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
            const value = target[property];
            if (typeof value === "function") {
                return value.bind(target);
            }
            return value;
        }
        return target.get(property);
    },
    deleteProperty(target, property) {
        if (typeof property === "symbol" || BYPASS_PROPERTIES.includes(property)) {
            return false;
        }
        target.delete(property);
        return true;
    },
    ownKeys(target) {
        return target.keys();
    },
    setPrototypeOf() {
        return false;
    },
    defineProperty() {
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

    #notifyChange = debounceCacheData((data) => {
        const changes = {};
        for (const {key, value, change} of data) {
            if (change != null) {
                mergeObjectsInto(changes, change);
            } else {
                changes[key] = value;
            }
        }
        // ---
        const ev = new Event("change");
        ev.data = changes;
        this.dispatchEvent(ev);
    });

    #getEventManager(key) {
        if (this.#eventManagers.has(key)) {
            return this.#eventManagers.get(key);
        }
        const manager = new EventTargetManager();
        manager.set("update", (event) => {
            const value = this.get(key);
            const change = {[key]: event.change}
            // ---
            const ev = new Event("update");
            ev.change = change;
            ev.key = key;
            ev.value = value;
            this.dispatchEvent(ev);
            // ---
            this.#notifyChange({
                key,
                value,
                change
            });
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
        if (data instanceof Observable) {
            const eventManager = this.#getEventManager(key);
            eventManager.switchTarget(null);
        }
    }

    set(key, value) {
        const oldValue = this.#buffer.get(key);
        if (!isEqual(oldValue, value)) {
            if (oldValue instanceof Observable && typeof value === "object") {
                for (const key in value) {
                    const buffer = value[key];
                    oldValue[key] = buffer;
                }
            } else {
                if (oldValue instanceof Observable) {
                    this.#unobserve(key, oldValue);
                }
                value = this.#observe(key, value);
                this.#buffer.set(key, value);
                // ---
                const ev = new Event("update");
                ev.change = {[key]: value};
                ev.key = key;
                ev.value = value;
                this.dispatchEvent(ev);
                // ---
                this.#notifyChange({
                    key,
                    value
                });
            }
        }
    }

    get(key) {
        return this.#buffer.get(key);
    }

    delete(key) {
        const oldValue = this.#buffer.get(key);
        if (oldValue != null) {
            this.#unobserve(key, oldValue);
            this.#buffer.delete(key);
            // ---
            const ev = new Event("update");
            ev.change = {[key]: undefined};
            ev.key = key;
            ev.value = undefined;
            this.dispatchEvent(ev);
            // ---
            this.#notifyChange({
                key,
                value: undefined
            });
        }
    }

    keys() {
        return Array.from(this.#buffer.keys());
    }

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]()
    }

    toJSON() {
        return Object.fromEntries(this.#buffer);
    }

    toString() {
        return "[object Observable]";
    }

}
