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
            ev.changes = {[key]: {oldValue, newValue: value}};
            ev.changed = {[key]: value};
            ev.data = this.getAll();
            this.dispatchEvent(ev);
        }
    }

    setAll(values) {
        const buffer = BUFFER.get(this);
        const changes = {};
        const changed = {};
        for (const key in values) {
            const newValue = values[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                buffer.set(key, newValue);
                changes[key] = {oldValue, newValue};
                changed[key] = newValue;
            }
        }
        // change event
        if (Object.keys(changes).length) {
            const ev = new Event("change");
            ev.changes = changes;
            ev.changed = changed;
            ev.data = this.getAll();
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
        buffer.delete(key);
        // change event
        if (typeof oldValue != "undefined") {
            const ev = new Event("change");
            ev.changes = {[key]: {oldValue, newValue: undefined}};
            ev.changed = {[key]: undefined};
            ev.data = this.getAll();
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
        const changes = {};
        const changed = {};
        for (const [key, oldValue] of buffer) {
            changes[key] = {oldValue, newValue: undefined};
            changed[key] = undefined;
        }
        buffer.clear();
        this.dispatchEvent(new Event("clear"));
        // change event
        if (Object.keys(changes).length) {
            const ev = new Event("change");
            ev.changes = changes;
            ev.changed = changed;
            ev.data = this.getAll();
            this.dispatchEvent(ev);
        }
    }
    
    serialize() {
        return this.getAll();
    }

    deserialize(data = {}) {
        const buffer = BUFFER.get(this);
        const changes = {};
        const changed = {};
        for (const [key, oldValue] of buffer) {
            changes[key] = {oldValue, newValue: undefined};
            changed[key] = undefined;
        }
        buffer.clear();
        for (const key in data) {
            const newValue = data[key];
            if (newValue != null) {
                changes[key] = {oldValue: changes[key]?.oldValue, newValue};
                changed[key] = newValue;
                buffer.set(key, newValue);
            }
        }
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
        // change event
        if (Object.keys(changes).length) {
            const ev = new Event("change");
            ev.changes = changes;
            ev.changed = changed;
            ev.data = this.getAll();
            this.dispatchEvent(ev);
        }
    }

    overwrite(data = {}) {
        const buffer = BUFFER.get(this);
        const changes = {};
        const changed = {};
        for (const key in data) {
            const newValue = data[key];
            const oldValue = this.get(key);
            if (oldValue != newValue) {
                if (newValue == null) {
                    buffer.delete(key);
                    changes[key] = {oldValue, newValue: undefined};
                    changed[key] = undefined;
                } else {
                    buffer.set(key, newValue);
                    changes[key] = {oldValue, newValue};
                    changed[key] = newValue;
                }
            }
        }
        // change event
        if (Object.keys(changes).length) {
            const ev = new Event("change");
            ev.changes = changes;
            ev.changed = changed;
            ev.data = this.getAll();
            this.dispatchEvent(ev);
        }
    }

}
