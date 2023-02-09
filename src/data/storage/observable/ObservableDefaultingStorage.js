
import ObservableStorage from "./ObservableStorage.js";

export default class ObservableDefaultingStorage extends ObservableStorage {

    #defaults = new Map();

    clone() {
        const instance = super.clone();
        for (const [key, value] of this.#defaults) {
            instance.#defaults.set(key, value);
        }
        return instance;
    }

    setDefault(key, value) {
        const old = this.#defaults.get(key);
        if (old != value) {
            this.#defaults.set(key, value);
            if (!super.has(key)) {
                const ev = new Event("change");
                ev.data = {[key]: value};
                this.dispatchEvent(ev);
            }
        }
    }

    getDefault(key) {
        return this.#defaults.get(key);
    }

    clear() {
        this.#defaults.clear();
        super.clear();
    }

    resetValue(key) {
        const value = this.#defaults.get(key);
        super.set(key, value);
    }

    resetAll(keys) {
        const values = {};
        for (const key of keys) {
            values[key] = this.#defaults.get(key);
        }
        super.setAll(values);
    }

    set(key, value) {
        if (this.#defaults.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (this.#defaults.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        if (this.#defaults.has(key)) {
            return super.get(key);
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#defaults) {
            res[key] = super.get(key) ?? value;
        }
        return res;
    }

    delete(key) {
        if (this.#defaults.has(key)) {
            super.delete(key);
        }
    }

    has(key) {
        return this.#defaults.has(key);
    }

    keys() {
        return this.#defaults.keys();
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of this.#defaults) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of this.#defaults) {
            if (key in data) {
                const newValue = data[key];
                res[key] = newValue;
            }
        }
        super.overwrite(res);
    }

}
