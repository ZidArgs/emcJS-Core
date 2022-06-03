export default class ObservableStorage extends EventTarget {

    #buffer = new Map();

    set(key, value) {
        const oldValue = this.get(key);
        // change event
        if (oldValue != value) {
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
            if (oldValue != newValue) {
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
        return this.#buffer.get(key);
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
        if (typeof oldValue != "undefined") {
            this.#buffer.delete(key);
            const defValue = this.get(key);
            const ev = new Event("change");
            ev.data = {[key]: defValue};
            ev.changes = {[key]: {oldValue, newValue: defValue}};
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
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                if (newValue == null) {
                    this.#buffer.delete(key);
                    const defValue = this.get(key);
                    values[key] = defValue;
                    changes[key] = {oldValue, newValue: defValue};
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

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]()
    }

}
