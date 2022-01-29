const BUFFER = new WeakMap();

export default class DataStorage extends EventTarget {

    constructor() {
        super();
        const buffer = new Map();
        BUFFER.set(this, buffer);
    }

    set(key, value) {
        const buffer = BUFFER.get(this);
        const oldValue = this.get(key);
        // change event
        if (oldValue != value) {
            buffer.set(key, value);
            const ev = new Event("change");
            ev.data = {[key]: value};
            ev.changes = {[key]: {oldValue, newValue: value}};
            this.dispatchEvent(ev);
        }
    }

    setAll(data) {
        const buffer = BUFFER.get(this);
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                buffer.set(key, newValue);
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

    get(key, value) {
        const buffer = BUFFER.get(this);
        return buffer.get(key) ?? value;
    }

    getAll() {
        const buffer = BUFFER.get(this);
        const res = {};
        for (const [key, value] of buffer) {
            res[key] = value;
        }
        return res;
    }

    delete(key) {
        const buffer = BUFFER.get(this);
        const oldValue = buffer.get(key);
        if (typeof oldValue != "undefined") {
            buffer.delete(key);
            const defValue = this.get(key);
            const ev = new Event("change");
            ev.data = {[key]: defValue};
            ev.changes = {[key]: {oldValue, newValue: defValue}};
            this.dispatchEvent(ev);
        }
    }

    has(key) {
        const buffer = BUFFER.get(this);
        return buffer.has(key);
    }

    keys() {
        const buffer = BUFFER.get(this);
        return buffer.keys();
    }

    clear() {
        const buffer = BUFFER.get(this);
        buffer.clear();
        const ev = new Event("clear");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    serialize() {
        return this.getAll();
    }

    deserialize(data = {}) {
        const buffer = BUFFER.get(this);
        buffer.clear();
        for (const key in data) {
            const newValue = data[key];
            if (newValue != null) {
                buffer.set(key, newValue);
            }
        }
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    overwrite(data = {}) {
        const buffer = BUFFER.get(this);
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                if (newValue == null) {
                    buffer.delete(key);
                    const defValue = this.get(key);
                    values[key] = defValue;
                    changes[key] = {oldValue, newValue: defValue};
                } else {
                    buffer.set(key, newValue);
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
        const buffer = BUFFER.get(this);
        return buffer[Symbol.iterator]()
    }

}
