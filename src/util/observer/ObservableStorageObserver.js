import AppStateStorageWrapper from "../../data/state/AppStateStorageWrapper.js";
import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import {
    debounce
} from "../Debouncer.js";
import EventTargetManager from "../event/EventTargetManager.js";
import {
    isEqual
} from "../helper/Comparator.js";

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

    #storageEventManager;

    #key;

    #value;

    constructor(storage, key) {
        if (!(storage instanceof ObservableStorage) && !(storage instanceof AppStateStorageWrapper)) {
            throw new TypeError("wrong type on parameter 1, expected ObservableStorage or AppStateStorageWrapper");
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
        this.#storageEventManager = new EventTargetManager(storage);
        this.#key = key;
        this.#value = storage.get(key);
        /* --- */
        this.#storageEventManager.set("change", (event) => {
            if (this.#key != null && event.changes[this.#key] != null) {
                const newValue = event.changes[this.#key].newValue;
                this.#updateValue(newValue);
            }
        });
        this.#storageEventManager.set("clear", (event) => {
            if (this.#key != null) {
                const newValue = event.data[this.#key];
                this.#updateValue(newValue);
            }
        });
        this.#storageEventManager.set("load", (event) => {
            if (this.#key != null) {
                const newValue = event.data[this.#key];
                this.#updateValue(newValue);
            }
        });
        this.#storageEventManager.set("observer::replace_with", (event) => {
            const {newStorage} = event;
            if (newStorage instanceof ObservableStorage) {
                this.#storageEventManager.switchTarget(newStorage);
                this.#updateValue(newStorage.get(key));
            }
        });
        /* --- */
        ObservableStorageObserver.#setInstance(storage, key, this);
    }

    #updateValue = debounce((newValue) => {
        if (!isEqual(this.#value, newValue)) {
            const oldValue = this.#value;
            this.#value = newValue;
            // ---
            const ev = new Event("change");
            ev.value = newValue;
            ev.oldValue = oldValue;
            this.dispatchEvent(ev);
        }
    });

    get key() {
        return this.#key;
    }

    get value() {
        return this.#storageEventManager.target.get(this.#key);
    }

    set value(value) {
        this.#storageEventManager.target.set(this.#key, value);
    }

}
