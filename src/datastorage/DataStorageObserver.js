import DataStorage from "./DataStorage.js";

export default class DataStorageObserver extends EventTarget {

    #storage;

    #key;

    #def;

    constructor(storage, key, def) {
        if (!(storage instanceof DataStorage)) {
            throw new TypeError("wrong type on parameter 1, expected DataStorage");
        }
        if (key != null && typeof key != "string") {
            throw new TypeError("wrong type on parameter 2, expected string");
        }
        super();
        /* --- */
        this.#storage = storage;
        this.#key = key;
        this.#def = def;
        /* --- */
        storage.addEventListener("change", (event) => {
            if (this.#key != null && event.changes[this.#key] != null) {
                const ev = new Event("change");
                ev.value = event.changes[this.#key].newValue ?? def;
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("clear", event => {
            if (this.#key != null) {
                const ev = new Event("change");
                ev.value = event.data[this.#key] ?? def;
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("load", (event) => {
            if (this.#key != null) {
                const ev = new Event("change");
                ev.data = event.data[this.#key] ?? def;
                this.dispatchEvent(ev);
            }
        });
    }

    get key() {
        return this.#key;
    }

    set key(value) {
        if (typeof value == "string") {
            const oldKey = this.#key;
            if (oldKey != value) {
                this.#key = value;
                /* event */
                const oldValue = this.#storage.get(oldKey);
                const newValue = this.#storage.get(value);
                if (oldValue != newValue) {
                    const ev = new Event("change");
                    ev.data = newValue;
                    this.dispatchEvent(ev);
                }
            }
        }
    }

    get value() {
        return this.#storage.get(this.#key, this.#def);
    }

    set value(value) {
        this.#storage.set(this.#key, value);
    }

}
