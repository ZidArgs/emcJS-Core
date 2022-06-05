import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";

export default class ObservableStorageObserver extends EventTarget {

    static #instances = new Map();

    static #setInstance(storage, key, inst) {
        if (this.#instances.has(storage)) {
            const insts = this.#instances.get(storage);
            insts.set(key, inst);
        } else {
            const insts = new Map();
            insts.set(key, inst);
            this.#instances.set(storage, insts);
        }
    }

    static #getInstance(storage, key) {
        const insts = this.#instances.get(storage);
        return insts?.get(key);
    }

    #storage;

    #key;

    #value;

    constructor(storage, key) {
        if (!(storage instanceof ObservableStorage)) {
            throw new TypeError("wrong type on parameter 1, expected ObservableStorage");
        }
        if (key != null && typeof key != "string") {
            throw new TypeError("wrong type on parameter 2, expected string");
        }
        /* --- */
        const inst = ObservableStorageObserver.#getInstance(storage, key);
        if (inst != null) {
            return inst;
        }
        super();
        /* --- */
        this.#storage = storage;
        this.#key = key;
        this.#value = storage.get(key);
        /* --- */
        storage.addEventListener("change", (event) => {
            if (this.#key != null && event.changes[this.#key] != null) {
                const oldValue = this.#value;
                const newValue = event.changes[this.#key].newValue;
                this.#value = newValue;
                // ---
                const ev = new Event("change");
                ev.value = newValue;
                ev.oldValue = oldValue;
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("clear", event => {
            if (this.#key != null) {
                const oldValue = this.#value;
                const newValue = event.data[this.#key];
                this.#value = newValue;
                // ---
                const ev = new Event("change");
                ev.value = newValue;
                ev.oldValue = oldValue;
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("load", (event) => {
            if (this.#key != null) {
                const oldValue = this.#value;
                const newValue = event.data[this.#key];
                this.#value = newValue;
                // ---
                const ev = new Event("change");
                ev.value = newValue;
                ev.oldValue = oldValue;
                this.dispatchEvent(ev);
            }
        });
        /* --- */
        ObservableStorageObserver.#setInstance(storage, key, this);
    }

    get key() {
        return this.#key;
    }

    get value() {
        return this.#storage.get(this.#key);
    }

    set value(value) {
        this.#storage.set(this.#key, value);
    }

}
