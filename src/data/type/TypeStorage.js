import {
    debounceCacheData
} from "../../util/Debouncer.js";
import {
    isEqual
} from "../../util/helper/Comparator.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import TypeValidator from "../../util/type/TypeValidator.js";

const REGISTER_LISTENER = new Set();

const STORAGES = new Map();

export default class TypeStorage extends EventTarget {

    #typeName;

    #buffer = new Map();

    constructor(typeName) {
        if (STORAGES.has(typeName)) {
            return STORAGES.get(typeName);
        }
        super();
        this.#typeName = typeName;
        STORAGES.set(typeName, this);
        TypeStorage.#callListeners(typeName);
    }

    set(key, value) {
        // validation
        const validationErrors = TypeValidator.validate(this.#typeName, value, {
            label: `${this.#typeName} -> ${key}`,
            strict: true
        });
        if (validationErrors.length > 0) {
            const msg = validationErrors.map((s) => s.split("\n").join("\n\t")).join("\n\t");
            throw new Error(`Error validating type:\n\t${msg}`);
        }
        // write
        const oldValue = this.get(key);
        if (!isEqual(oldValue, value)) {
            this.#buffer.set(key, value);
            // event
            const ev = new Event("change");
            ev.data = {[key]: value};
            ev.changes = {[key]: {oldValue, newValue: value}};
            this.dispatchEvent(ev);
        }
    }

    setAll(data) {
        const allErrors = [];
        const values = {};
        const changes = {};
        for (const key in data) {
            // validation
            const newValue = data[key];
            const validationErrors = TypeValidator.validate(this.#typeName, newValue, {
                label: `${this.#typeName} -> ${key}`,
                strict: true
            });
            if (validationErrors.length > 0) {
                allErrors.push(validationErrors.map((s) => s.split("\n").join("\n\t")).join("\n\t"));
                continue;
            }
            // write
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                this.#buffer.set(key, newValue);
                values[key] = newValue;
                changes[key] = {oldValue, newValue};
            }
        }
        // event
        if (Object.keys(values).length) {
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
        // errors
        if (allErrors.length) {
            throw new Error(`Error validating type:\n\t${allErrors.join("\n\t")}`);
        }
    }

    get(key) {
        if (this.#buffer.has(key)) {
            return deepClone(this.#buffer.get(key));
        }
        return null;
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#buffer) {
            res[key] = deepClone(value);
        }
        return res;
    }

    delete(key) {
        const oldValue = this.#buffer.get(key);
        if (oldValue != null) {
            this.#buffer.delete(key);
            const ev = new Event("change");
            ev.data = {[key]: undefined};
            ev.changes = {[key]: {oldValue, newValue: undefined}};
            this.dispatchEvent(ev);
        }
    }

    has(key) {
        return this.#buffer.has(key);
    }

    keys() {
        return this.#buffer.keys();
    }

    clear() {
        this.#buffer.clear();
        const ev = new Event("clear");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    serialize() {
        return this.getAll();
    }

    deserialize(data = {}) {
        const allErrors = [];
        this.#buffer.clear();
        for (const key in data) {
            // validation
            const newValue = data[key];
            const validationErrors = TypeValidator.validate(this.#typeName, newValue, {
                label: `${this.#typeName} -> ${key}`,
                strict: true
            });
            if (validationErrors.length > 0) {
                allErrors.push(validationErrors.map((s) => s.split("\n").join("\n\t")).join("\n\t"));
                continue;
            }
            // write
            if (newValue != null) {
                this.#buffer.set(key, newValue);
            }
        }
        // event
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
        // errors
        if (allErrors.length) {
            throw new Error(`Error validating type:\n\t${allErrors.join("\n\t")}`);
        }
    }

    overwrite(data = {}) {
        const allErrors = [];
        const values = {};
        const changes = {};
        for (const key in data) {
            // validation
            const newValue = data[key];
            const validationErrors = TypeValidator.validate(this.#typeName, newValue, {
                label: `${this.#typeName} -> ${key}`,
                strict: true
            });
            if (validationErrors.length > 0) {
                allErrors.push(validationErrors.map((s) => s.split("\n").join("\n\t")).join("\n\t"));
                continue;
            }
            // write
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                if (newValue == null) {
                    this.#buffer.delete(key);
                    values[key] = undefined;
                    changes[key] = {oldValue, newValue: undefined};
                } else {
                    this.#buffer.set(key, newValue);
                    values[key] = newValue;
                    changes[key] = {oldValue, newValue};
                }
            }
        }
        // event
        if (Object.keys(values).length) {
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
        // errors
        if (allErrors.length) {
            throw new Error(`Error validating type:\n\t${allErrors.join("\n\t")}`);
        }
    }

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]()
    }

    static getStorage(typeName) {
        if (STORAGES.has(typeName)) {
            return STORAGES.get(typeName);
        }
    }

    static onStorageRegister(callback) {
        if (typeof callback === "function") {
            REGISTER_LISTENER.add(callback);
        }
    }

    static unStorageRegister(callback) {
        if (typeof callback === "function") {
            REGISTER_LISTENER.delete(callback);
        }
    }

    static #callListeners = debounceCacheData((typeNames) => {
        for (const listener of REGISTER_LISTENER) {
            listener(typeNames);
        }
    });

}
