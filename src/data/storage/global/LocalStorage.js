import {debounceCacheData} from "../../../util/Debouncer.js";
import {isEqual} from "../../../util/helper/Comparator.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {jsonParseSafe} from "../../../util/helper/JSON.js";

class LocalStorage extends EventTarget {

    #storage = new Map();

    #read(key) {
        const res = localStorage.getItem(key);
        return jsonParseSafe(res);
    }

    #write(key, value) {
        try {
            if (value == null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch {
            return;
        }
    }

    constructor() {
        super();
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            const value = this.#read(key);
            if (value != null) {
                this.#storage.set(key, value);
            }
        }
        // event
        window.addEventListener("storage", (event) => {
            const {
                key, newValue, storageArea
            } = event;
            if (storageArea === localStorage) {
                if (key == null) {
                    this.#storage.clear();
                    // clear event
                    const ev = new Event("clear");
                    ev.data = this.getAll();
                    this.dispatchEvent(ev);
                } else {
                    this.#applySync(key, jsonParseSafe(newValue));
                }
            }
        });
    }

    #applySync = debounceCacheData((data) => {
        const values = {};
        const changes = {};
        for (const [key, newValue] of data) {
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                if (newValue == null) {
                    this.#storage.delete(key);
                    this.#write(key);
                } else {
                    const clonedValue = deepClone(newValue);
                    this.#storage.set(key, clonedValue);
                    this.#write(key, newValue);
                }
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
    });

    set(key, value) {
        const oldValue = this.#storage.get(key);
        if (!isEqual(oldValue, value)) {
            const clonedValue = deepClone(value);
            this.#storage.set(key, clonedValue);
            this.#write(key, value);
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
        return this.#storage.get(key) ?? value;
    }

    has(key) {
        return this.#storage.has(key);
    }

    delete(key) {
        const oldValue = this.#storage.get(key);
        if (oldValue != null) {
            this.#storage.delete(key);
            this.#write(key);
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
        localStorage.clear();
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
                this.#write(key, newValue);
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
                    this.#write(key);
                    values[key] = null;
                    changes[key] = {
                        oldValue,
                        newValue: null
                    };
                } else {
                    const clonedValue = deepClone(newValue);
                    this.#storage.set(key, clonedValue);
                    this.#write(key, newValue);
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
                this.#write(key);
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

export default new LocalStorage;
