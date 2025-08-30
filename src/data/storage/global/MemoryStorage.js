import {isEqual} from "../../../util/helper/Comparator.js";
import {deepClone} from "../../../util/helper/DeepClone.js";

class MemoryStorage extends EventTarget {

    #storage = new Map();

    set(key, value) {
        const oldValue = this.#storage.get(key);
        if (!isEqual(oldValue, value)) {
            const clonedValue = deepClone(value);
            this.#storage.set(key, clonedValue);
            // change event
            const ev = new Event("change");
            ev.data = {[key]: value};
            ev.changes = {
                [key]: {
                    oldValue,
                    newValue: value
                }
            };
            this.dispatchEvent(ev);
        }
    }

    get(key, value) {
        const res = this.#storage.get(key);
        return res ?? value;
    }

    has(key) {
        return this.#storage.has(key);
    }

    delete(key) {
        const oldValue = this.get(key);
        if (oldValue != null) {
            this.#storage.delete(key);
            // change event
            const ev = new Event("change");
            ev.data = {[key]: null};
            ev.changes = {
                [key]: {
                    oldValue,
                    newValue: null
                }
            };
            this.dispatchEvent(ev);
        }
    }

    clear() {
        this.#storage.clear();
        // clear event
        const ev = new Event("clear");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    keys(filter) {
        const keys = this.#storage.keys();
        if (typeof filter === "string") {
            return keys.filter((key) => key.startsWith(filter));
        }
        return keys;
    }

    setAll(data) {
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                const clonedValue = deepClone(newValue);
                this.#storage.set(key, clonedValue);
                values[key] = newValue;
                changes[key] = {
                    oldValue,
                    newValue
                };
            }
        }
        if (Object.keys(values).length) {
            // change event
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
    }

    getAll(filter) {
        const entries = this.#storage.entries();
        if (typeof filter === "string") {
            return entries.filter(([key]) => key.startsWith(filter));
        }
        const res = entries.map(([key, value]) => [key, deepClone(value)]);
        return Object.fromEntries(res);
    }

    serialize() {
        return this.getAll();
    }

    deserialize(data = {}) {
        const values = {};
        const changes = {};
        const unused = new Set(this.#storage.keys());
        for (const key in data) {
            unused.delete(key);
            const newValue = data[key];
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                if (newValue == null) {
                    this.#storage.delete(key);
                    values[key] = null;
                    changes[key] = {
                        oldValue,
                        newValue: null
                    };
                } else {
                    const clonedValue = deepClone(newValue);
                    this.#storage.set(key, clonedValue);
                    values[key] = newValue;
                    changes[key] = {
                        oldValue,
                        newValue
                    };
                }
            }
        }
        for (const key of unused) {
            const oldValue = this.get(key);
            if (oldValue != null) {
                this.#storage.delete(key);
                values[key] = null;
                changes[key] = {
                    oldValue,
                    newValue: null
                };
            }
        }
        if (Object.keys(values).length) {
            // change event
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
    }

}

export default new MemoryStorage;
