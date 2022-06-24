import {
    debounceCacheData
} from "../../../util/Debouncer.js";

export default class ObservableStorage extends EventTarget {

    #buffer = new Map();

    #notifyChange = debounceCacheData((params) => {
        const data = {};
        const changes = {};
        for (const {key, oldValue, newValue} of params) {
            data[key] = newValue;
            if (changes[key] != null) {
                changes[key].newValue = newValue;
            } else {
                changes[key] = {oldValue, newValue};
            }
        }
        // ---
        const ev = new Event("change");
        ev.data = data;
        ev.changes = changes;
        this.dispatchEvent(ev);
    });

    setDefault(key, oldValue, newValue) {
        this.#notifyChange({key, oldValue, newValue});
    }

    getDefault() {
        // nothing
    }

    set(key, value) {
        const oldValue = this.get(key);
        // change event
        if (oldValue != value) {
            this.#buffer.set(key, value);
            this.#notifyChange({key, oldValue, newValue: value});
        }
    }

    setAll(data) {
        const changes = [];
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                this.#buffer.set(key, newValue);
                changes.push({key, oldValue, newValue});
            }
        }
        // change event
        if (Object.keys(changes).length) {
            this.#notifyChange(...changes);
        }
    }

    get(key) {
        return this.#buffer.get(key) ?? this.getDefault();
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#buffer) {
            res[key] = value;
        }
        return res;
    }

    delete(key) {
        const oldValue = this.#buffer.get(key);
        if (oldValue != null) {
            this.#buffer.delete(key);
            const defaultValue = this.getDefault(key);
            this.#notifyChange({key, oldValue, newValue: defaultValue});
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
        this.#buffer.clear();
        for (const key in data) {
            const newValue = data[key];
            if (newValue != null) {
                this.#buffer.set(key, newValue);
            }
        }
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    overwrite(data = {}) {
        const changes = [];
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                if (newValue == null) {
                    this.#buffer.delete(key);
                    const defaultValue = this.getDefault(key);
                    changes.push({key, oldValue, newValue: defaultValue});
                } else {
                    this.#buffer.set(key, newValue);
                    changes.push({key, oldValue, newValue});
                }
            }
        }
        // change event
        if (Object.keys(changes).length) {
            this.#notifyChange(...changes);
        }
    }

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]()
    }

}
