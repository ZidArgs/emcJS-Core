import DataStorage from "./DataStorage.js";

const STORAGE = new WeakMap();
const DEF = new WeakMap();
const KEY = new WeakMap();

export default class DataStorageObserver extends EventTarget {

    constructor(storage, key, def) {
        if (!(storage instanceof DataStorage)) {
            throw new TypeError("wrong type on parameter 1, expected DataStorage");
        }
        if (key != null && typeof key != "string") {
            throw new TypeError("wrong type on parameter 2, expected string");
        }
        super();
        /* --- */
        KEY.set(this, key);
        DEF.set(this, def);
        STORAGE.set(this, storage);
        storage.addEventListener("change", (event) => {
            const key = KEY.get(this);
            if (key != null && event.changes[key] != null) {
                const ev = new Event("change");
                ev.data = event.changes[key].newValue ?? def;
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("clear", event => {
            const key = KEY.get(this);
            if (key != null) {
                const ev = new Event("change");
                ev.data = event.data[key] ?? def;
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("load", (event) => {
            const key = KEY.get(this);
            if (key != null) {
                const ev = new Event("change");
                ev.data = event.data[key] ?? def;
                this.dispatchEvent(ev);
            }
        });
    }

    get key() {
        return KEY.get(this);
    }

    set key(value) {
        if (typeof key == "string") {
            const oldKey = KEY.get(this);
            if (oldKey != value) {
                KEY.set(this, value);
                /* event */
                const storage = STORAGE.get(this);
                const oldValue = storage.get(oldKey);
                const newValue = storage.get(value);
                if (oldValue != newValue) {
                    const ev = new Event("change");
                    ev.data = newValue;
                    this.dispatchEvent(ev);
                }
            }
        }
    }

    get value() {
        const storage = STORAGE.get(this);
        const key = KEY.get(this);
        const def = DEF.get(this);
        return storage.get(key, def);
    }

    set value(value) {
        const storage = STORAGE.get(this);
        const key = KEY.get(this);
        storage.set(key, value);
    }

}
