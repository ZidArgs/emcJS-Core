import {
    isEqual
} from "../../../util/helper/Comparator.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";

export default class ObservableStorage extends EventTarget {

    #rootData = new Map();

    #changeData = new Map();

    #buffer = new Map();

    get size() {
        return this.#buffer.size;
    }

    clone() {
        const instance = new this.constructor();
        for (const [key, value] of this.#buffer) {
            instance.#buffer.set(key, value);
        }
        return instance;
    }

    getDefault() {
        // nothing
    }

    set(key, value) {
        const oldValue = this.get(key);
        // change event
        if (!isEqual(oldValue, value)) {
            this.#writeChangeData(key, value);
            this.#buffer.set(key, value);
            const ev = new Event("change");
            ev.data = {[key]: value};
            ev.changes = {[key]: {oldValue, newValue: value}};
            this.dispatchEvent(ev);
        }
    }

    setAll(data) {
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                this.#writeChangeData(key, newValue);
                this.#buffer.set(key, newValue);
                values[key] = newValue;
                changes[key] = {oldValue, newValue};
            }
        }
        // change event
        if (Object.keys(values).length) {
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
    }

    get(key) {
        return deepClone(this.#buffer.get(key) ?? this.getDefault());
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
            this.#writeChangeData(key, null);
            this.#buffer.delete(key);
            const defaultValue = this.getDefault(key);
            const ev = new Event("change");
            ev.data = {[key]: defaultValue};
            ev.changes = {[key]: {oldValue, newValue: defaultValue}};
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
        this.#rootData.clear();
        this.#changeData.clear();
        this.#buffer.clear();
        const ev = new Event("clear");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    serialize() {
        return this.getAll();
    }

    deserialize(data = {}) {
        this.#rootData.clear();
        this.#changeData.clear();
        this.#buffer.clear();
        for (const key in data) {
            const newValue = data[key];
            if (newValue != null) {
                this.#rootData.set(key, newValue);
                this.#buffer.set(key, newValue);
            }
        }
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    overwrite(data = {}) {
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                this.#writeChangeData(key, newValue);
                if (newValue == null) {
                    this.#buffer.delete(key);
                    const defaultValue = this.getDefault(key);
                    values[key] = defaultValue;
                    changes[key] = {oldValue, newValue: defaultValue};
                } else {
                    this.#buffer.set(key, newValue);
                    values[key] = newValue;
                    changes[key] = {oldValue, newValue};
                }
            }
        }
        // change event
        if (Object.keys(values).length) {
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
    }

    getRootValue(key) {
        return this.#rootData.get(key);
    }

    hasChanges() {
        return this.#changeData.size > 0;
    }

    getChanges() {
        const res = {};
        for (const [key, value] of this.#changeData) {
            res[key] = value;
        }
        return res;
    }

    flushChanges() {
        for (const [key, value] of this.#changeData) {
            this.#rootData.set(key, value);
        }
        this.#changeData.clear();
    }

    resetValueChange(key) {
        const oldValue = this.#buffer.get(key);
        if (this.#rootData.has(key)) {
            const newValue = this.#rootData.get(key);
            this.#buffer.set(key, newValue);
        } else {
            this.#buffer.delete(key);
        }
        this.#changeData.delete(key);
        const defaultValue = this.getDefault(key);
        const ev = new Event("change");
        ev.data = {[key]: defaultValue};
        ev.changes = {[key]: {oldValue, newValue: defaultValue}};
        this.dispatchEvent(ev);
    }

    purgeChanges() {
        for (const [key] of this.#changeData) {
            if (this.#rootData.has(key)) {
                const newValue = this.#rootData.get(key);
                this.#buffer.set(key, newValue);
            } else {
                this.#buffer.delete(key);
            }
        }
        this.#changeData.clear();
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]()
    }

    #writeChangeData(key, value) {
        if (this.#rootData.get(key) === value) {
            this.#changeData.delete(key);
        } else {
            this.#changeData.set(key, value);
        }
    }

}
