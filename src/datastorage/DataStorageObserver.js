import DataStorage from "./DataStorage.js";

const INSTANCES = new Map();
const STORAGE = new WeakMap();
const KEY = new WeakMap();

function getInstance(storage, key) {
    const sInts = INSTANCES.get(storage);
    if (sInts != null) {
        return sInts.get(key);
    }
}

function setInstance(storage, key, inst) {
    const sInts = INSTANCES.get(storage);
    if (sInts != null) {
        sInts.set(key, inst);
    } else {
        const insts = new Map();
        insts.set(key, inst);
        INSTANCES.set(storage, insts);
    }
}

export default class DataStorageObserver extends EventTarget {

    constructor(storage, key) {
        if (!(storage instanceof DataStorage)) {
            throw new TypeError("Wrong 1. parameter Type for DataStorageObserver, expected DataStorage");
        }
        if (typeof key != "string") {
            throw new TypeError("Wrong 2. parameter Type for DataStorageObserver, expected string");
        }
        const inst = getInstance(storage, key);
        if (inst != null) {
            return inst;
        }
        super();
        KEY.set(this, key);
        STORAGE.set(this, storage);
        storage.addEventListener("change", event => {
            const key = KEY.get(this);
            if (event.data[key] != null) {
                const ev = new Event("change");
                ev.data = event.data[key];
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("clear", event => {
            const key = KEY.get(this);
            const ev = new Event("change");
            ev.data = event.data[key];
            this.dispatchEvent(ev);
        });
        storage.addEventListener("load", event => {
            const key = KEY.get(this);
            const ev = new Event("change");
            ev.data = event.data[key];
            this.dispatchEvent(ev);
        });
        setInstance(storage, key, this);
    }

    get key() {
        return KEY.get(this);
    }

    get value() {
        const storage = STORAGE.get(this);
        const key = KEY.get(this);
        return storage.get(key);
    }

    set value(value) {
        const storage = STORAGE.get(this);
        const key = KEY.get(this);
        storage.set(key, value);
    }

}
