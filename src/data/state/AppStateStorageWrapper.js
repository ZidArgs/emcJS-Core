import EventTargetManager from "../../util/event/EventTargetManager.js";
import ObservableStorage from "../storage/observable/ObservableStorage.js";

export default class AppStateStorageWrapper extends EventTarget {

    static #instances = new Map();

    static #setInstance(storage, inst) {
        this.#instances.set(storage, inst);
    }

    static #getInstance(storage) {
        return this.#instances.get(storage);
    }

    #storageEventManager;

    constructor(storage) {
        if (!(storage instanceof ObservableStorage)) {
            throw new TypeError("wrong type on parameter 1, expected ObservableStorage");
        }
        /* --- */
        const inst = AppStateStorageWrapper.#getInstance(storage);
        if (inst != null) {
            return inst;
        }
        super();
        /* --- */
        this.#storageEventManager = new EventTargetManager(storage);
        this.#storageEventManager.set("change", (event) => {
            const ev = new Event("change");
            ev.data = event.data;
            ev.changes = event.changes;
            this.dispatchEvent(ev);
        });
        this.#storageEventManager.set("clear", (event) => {
            const ev = new Event("clear");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        this.#storageEventManager.set("load", (event) => {
            const ev = new Event("load");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        this.#storageEventManager.set("storage::replace_with", (event) => {
            const {newStorage} = event;
            if (newStorage instanceof ObservableStorage) {
                this.#storageEventManager.switchTarget(newStorage);
            }
        });
        /* --- */
        AppStateStorageWrapper.#setInstance(storage, this);
    }

    get target() {
        return this.#storageEventManager.target;
    }

    clone() {
        const instance = this.#storageEventManager.target.clone();
        return new this.constructor(instance);
    }

    getDefault() {
        return this.#storageEventManager.target.getDefault();
    }

    set(key, value) {
        this.#storageEventManager.target.set(key, value);
    }

    setAll(data) {
        this.#storageEventManager.target.setAll(data);
    }

    get(key) {
        return this.#storageEventManager.target.get(key);
    }

    getAll() {
        return this.#storageEventManager.target.getAll();
    }

    delete(key) {
        this.#storageEventManager.target.delete(key);
    }

    has(key) {
        return this.#storageEventManager.target.has(key);
    }

    keys() {
        return this.#storageEventManager.target.keys();
    }

    clear() {
        this.#storageEventManager.target.clear();
    }

    clearAsChange() {
        this.#storageEventManager.target.clearAsChange();
    }

    serialize() {
        return this.#storageEventManager.target.serialize();
    }

    deserialize(data = {}) {
        this.#storageEventManager.target.deserialize(data);
    }

    deserializeAsChange(data = {}) {
        this.#storageEventManager.target.deserializeAsChange(data);
    }

    overwrite(data = {}) {
        this.#storageEventManager.target.overwrite(data);
    }

    setRootValue(key, value) {
        this.#storageEventManager.target.setRootValue(key, value);
    }

    getRootValue(key) {
        return this.#storageEventManager.target.getRootValue(key);
    }

    hasChanges() {
        return this.#storageEventManager.target.hasChanges();
    }

    getChanges() {
        return this.#storageEventManager.target.getChanges();
    }

    flushChanges() {
        this.#storageEventManager.target.flushChanges();
    }

    resetValueChange(key) {
        this.#storageEventManager.target.resetValueChange(key);
    }

    purgeChanges() {
        this.#storageEventManager.target.purgeChanges();
    }

    [Symbol.iterator]() {
        return this.#storageEventManager.target[Symbol.iterator]();
    }

}
