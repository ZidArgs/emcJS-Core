import IDBStorage from "./IDBStorage.js";

const STORAGE = new WeakMap();
const BUFFER = new WeakMap();

export default class IDBProxyStorage extends EventTarget {

    constructor(name) {
        super();
        const storage = new IDBStorage(name);
        STORAGE.set(this, storage);
        // ---
        storage.getAll().then(data => {
            BUFFER.set(this, new Map(Object.entries(data)));
            const ev = new Event("load");
            ev.data = data;
            this.dispatchEvent(ev);
        }).catch(err => {
            console.error(err);
            BUFFER.set(this, new Map());
            const ev = new Event("error");
            this.dispatchEvent(ev);
        });
    }

    awaitLoaded() {
        return new Promise((resolve) => {
            if (BUFFER.has(this)) {
                resolve(this);
            } else {
                function handler() {
                    resolve(this);
                    this.removeEventListener("load", handler);
                    this.removeEventListener("error", handler);
                }
                this.addEventListener("load", handler);
                this.addEventListener("error", handler);
            }
        });
    }

    set(key, value) {
        const storage = STORAGE.get(this);
        const buffer = BUFFER.get(this);
        const old = buffer.get(key);
        if (old != value) {
            buffer.set(key, value);
            storage.set(key, value);
            const ev = new Event("change");
            ev.changes = {[key]: {oldValue: old, newValue: value}};
            ev.data = {[key]: value};
            this.dispatchEvent(ev);
        }
    }

    setAll(values) {
        const storage = STORAGE.get(this);
        const buffer = BUFFER.get(this);
        const changes = {};
        const data = {};
        for (const key in values) {
            const value = values[key];
            const old = buffer.get(key);
            if (old != value) {
                buffer.set(key, value);
                changes[key] = {oldValue: old, newValue: value};
                data[key] = value;
            }
        }
        if (Object.keys(changes).length) {
            storage.setAll(data);
            const ev = new Event("change");
            ev.changes = changes;
            ev.data = data;
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
        const storage = STORAGE.get(this);
        const buffer = BUFFER.get(this);
        const old = buffer.get(key);
        buffer.delete(key);
        storage.delete(key);
        if (typeof old != "undefined") {
            const ev = new Event("change");
            ev.changes = {[key]: {oldValue: old, newValue: undefined}};
            ev.data = {[key]: undefined};
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
        const storage = STORAGE.get(this);
        const buffer = BUFFER.get(this);
        buffer.clear();
        storage.clear();
        const ev = new Event("clear");
        this.dispatchEvent(ev);
    }

}
