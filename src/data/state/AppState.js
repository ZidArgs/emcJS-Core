import ObservableStorage from "../storage/observable/ObservableStorage.js";

export default class AppState extends EventTarget {

    #storageChangeHandler = new Map();

    #meta = new Map();

    #registeredStorages = new Map();

    #requestedStorages = new Map();

    constructor(data) {
        super();
        /* --- */
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            dataStorage.deserialize(data[category]);
        }
    }

    purge() {
        this.#meta.clear();
        for (const [, dataStorage] of this.#registeredStorages) {
            dataStorage.clear();
        }
        for (const [, dataStorage] of this.#requestedStorages) {
            dataStorage.clear();
        }
    }

    /* SERIALIZATION */
    serialize() {
        const res = {
            meta: {},
            data: {}
        };
        for (const [key, value] of this.#meta) {
            res.meta[key] = value;
        }
        for (const [category, dataStorage] of this.#registeredStorages) {
            res.data[category] = dataStorage.serialize();
        }
        for (const [category, dataStorage] of this.#requestedStorages) {
            res.data[category] = dataStorage.serialize();
        }
        return res;
    }

    deserialize(obj = {}) {
        const {
            data = {},
            meta = {}
        } = obj;
        /* --- */
        this.#meta.clear();
        for (const [, dataStorage] of this.#registeredStorages) {
            dataStorage.clear();
        }
        for (const [, dataStorage] of this.#requestedStorages) {
            dataStorage.clear();
        }
        /* --- */
        for (const key in meta) {
            this.#meta.set(key, meta[key]);
        }
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            dataStorage.deserialize(data[category]);
        }
        /* --- */
        const ev = new Event("load");
        ev.data = this.serialize();
        this.dispatchEvent(ev);
    }

    overwrite(data = {}) {
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            const buffer = data[category];
            if (buffer == null) {
                dataStorage.clear();
            } else {
                dataStorage.overwrite(data[category]);
            }
        }
    }

    createNewJSON(initialData = {}) {
        const res = {
            meta: {},
            data: {}
        };
        for (const [category] of this.#registeredStorages) {
            res.data[category] = {};
            if (initialData[category] != null) {
                for (const key in initialData[category]) {
                    res.data[category][key] = initialData[category][key];
                }
            }
        }
        for (const [category] of this.#requestedStorages) {
            res.data[category] = {};
            if (initialData[category] != null) {
                for (const key in initialData[category]) {
                    res.data[category][key] = initialData[category][key];
                }
            }
        }
        return res;
    }

    /* META */
    getMeta(key) {
        return this.#meta.get(key);
    }

    setMeta(key, value) {
        const oldValue = this.#meta.get(key);
        if (oldValue != value) {
            this.#meta.set(key, value);
            const ev = new Event("meta");
            ev.data = {key, value};
            this.dispatchEvent(ev);
        }
    }

    /* STORAGES */
    registerStorage(category, dataStorage, eventName = "change") {
        const storageCategory = category.toString();
        if (!(dataStorage instanceof ObservableStorage)) {
            throw new TypeError("unknown storage implementation, expected DataStorage");
        }
        if (this.#registeredStorages.has(storageCategory)) {
            throw new Error(`special storage with name "${storageCategory}" already registerred`);
        }
        const handler = this.#getChangeHandler(storageCategory);
        if (this.#requestedStorages.has(storageCategory)) {
            const oldStorage = this.#requestedStorages.get(storageCategory);
            oldStorage.removeEventListener("change", handler);
            dataStorage.deserialize(oldStorage.serialize());
            this.#requestedStorages.delete(storageCategory);
        }
        this.#registeredStorages.set(storageCategory, dataStorage);
        dataStorage.addEventListener(eventName, handler);
    }

    getStorage(category) {
        const storageCategory = category.toString();
        if (this.#registeredStorages.has(storageCategory)) {
            return this.#registeredStorages.get(storageCategory);
        }
        if (this.#requestedStorages.has(storageCategory)) {
            return this.#requestedStorages.get(storageCategory);
        }
        const dataStorage = new ObservableStorage();
        dataStorage.addEventListener("change", this.#getChangeHandler(storageCategory));
        this.#requestedStorages.set(storageCategory, dataStorage);
        return dataStorage;
    }

    #getChangeHandler(category) {
        const storageCategory = category.toString();
        if (this.#storageChangeHandler.has(storageCategory)) {
            return this.#storageChangeHandler.get(storageCategory);
        }
        const handler = (event) => {
            const ev = new Event("change");
            ev.category = storageCategory;
            ev.data = event.data;
            ev.changes = event.changes;
            this.dispatchEvent(ev);
        };
        this.#storageChangeHandler.set(storageCategory, handler);
        return handler;
    }

    /* DATA */
    set(category, key, value) {
        const dataStorage = this.getStorage(category);
        if (typeof key == "object") {
            dataStorage.setAll(key);
        } else {
            dataStorage.set(key, value);
        }
    }

    get(category, key, def) {
        const dataStorage = this.getStorage(category);
        if (dataStorage.has(key)) {
            return dataStorage.get(key);
        }
        return def;
    }

    getAll(category) {
        if (category == null) {
            const res = {};
            for (const [cat, dataStorage] of this.#registeredStorages) {
                res[cat] = dataStorage.getAll();
            }
            for (const [cat, dataStorage] of this.#requestedStorages) {
                res[cat] = dataStorage.getAll();
            }
            return res;
        } else if (Array.isArray(category)) {
            const res = {};
            for (const cat of category) {
                const dataStorage = this.getStorage(cat);
                res[cat] = dataStorage.getAll();
            }
            return res;
        } else {
            const dataStorage = this.getStorage(category);
            return dataStorage.getAll();
        }
    }

    delete(category, key) {
        const dataStorage = this.getStorage(category);
        if (dataStorage.has(key)) {
            dataStorage.delete(key);
        }
    }

}
