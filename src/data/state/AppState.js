import ObservableStorage from "../storage/observable/ObservableStorage.js";

const CATEGORY_NAME_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/;

/**
 * Holds multiple storages based on a category system.
 *
 * Initially storages default to {@link ObservableStorage} but through registering any Storage extending {@link ObservableStorage} can be used.
 */
export default class AppState extends EventTarget {

    #storageChangeHandler = new Map();

    #eventNames = new Map();

    #meta = new Map();

    #registeredStorages = new Map();

    #requestedStorages = new Map();

    /**
     * Create a new {@link AppState} and optionally set its initial data.
     *
     * @param {Object.<string, Object.<string, *>>} [data] an Object containing the initial data
     */
    constructor(data) {
        super();
        /* --- */
        if (typeof data === "object" && !Array.isArray(data)) {
            for (const category in data) {
                const dataStorage = this.getStorage(category);
                if (dataStorage != null) {
                    dataStorage.deserialize(data[category]);
                }
            }
        }
    }

    /**
     * Create a new instance of {@link AppState} and copy all the {@link ObservableStorage}s and data to it.
     *
     * @returns {AppState} the new AppState with all the Storages and data cloned
     */
    clone() {
        const instance = new AppState();
        for (const [key, value] of this.#meta) {
            instance.#meta.set(key, value);
        }
        for (const [category, dataStorage] of this.#registeredStorages) {
            const clonedStorage = dataStorage.clone();
            const eventName = this.#eventNames.get(category);
            const handler = instance.#getChangeHandler(category);
            // ---
            dataStorage.addEventListener(eventName, handler);
            instance.#eventNames.set(category, eventName);
            instance.#registeredStorages.set(category, clonedStorage);
        }
        for (const [category, dataStorage] of this.#requestedStorages) {
            const clonedStorage = dataStorage.clone();
            const handler = instance.#getChangeHandler(category);
            // ---
            dataStorage.addEventListener("change", handler);
            instance.#requestedStorages.set(category, clonedStorage);
        }
        return instance;
    }

    /**
     * Clears all data from the internal {@link ObservableStorage}s and the meta storage.
     */
    purge() {
        this.#meta.clear();
        for (const [, dataStorage] of this.#registeredStorages) {
            dataStorage.clear();
        }
        for (const [, dataStorage] of this.#requestedStorages) {
            dataStorage.clear();
        }
    }

    /**
     * Returns an object representation of the data of all internal {@link ObservableStorage}s and the meta storage.
     *
     * @returns {{meta: Object.<string, *>, data: Object.<string, Object.<string, *>>}} an Object containing data of all internal Storages and the meta storage
     */
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

    /**
     * Clears and fills the internal {@link ObservableStorage}s and the meta storage with the given data, handling it as a stateload.
     *
     * @param {{meta: Object.<string, *>, data: Object.<string, Object.<string, *>>}} obj an Object containing data for the internal Storages and the meta storage
     */
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
            if (dataStorage != null) {
                dataStorage.deserialize(data[category]);
            }
        }
        /* --- */
        const ev = new Event("load");
        ev.data = this.serialize();
        this.dispatchEvent(ev);
    }

    /**
     * Overwrites the internal {@link ObservableStorage}s with the given data, handling it as a stateload.
     * Only overwrites the given keys for each respective Storage.
     *
     * @param {Object.<string, Object.<string, *>>} data an Object containing data for the internal Storages
     */
    overwrite(data = {}) {
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            if (dataStorage != null) {
                const buffer = data[category];
                if (buffer == null) {
                    dataStorage.clear();
                } else {
                    dataStorage.overwrite(data[category]);
                }
            }
        }
    }

    /**
     * Overwrites the internal {@link ObservableStorage}s with the given data, handling it as a stateload.
     * Clears the respective Storage before writing the data.
     *
     * @param {Object.<string, Object.<string, *>>} data an Object containing data for the internal Storages
     */
    overwriteClean(data = {}) {
        for (const category in data) {
            const dataStorage = this.getStorage(category);
            if (dataStorage != null) {
                const buffer = data[category];
                if (buffer == null) {
                    dataStorage.clear();
                } else {
                    dataStorage.deserialize(data[category]);
                }
            }
        }
    }

    /**
     * Returns an object representation of the default data of the internal {@link ObservableStorage}s and the meta storage the AppState holds.
     *
     * Additionally the initial data for the internal {@link ObservableStorage}s can be set.
     *
     * @param {Object.<string, Object.<string, *>>} [initialData] an Object containing the initial data
     * @returns {{meta: Object.<string, *>, data: Object.<string, Object.<string, *>>}} an Object containing the default data of the internal Storages and the meta storage
     */
    createNewData(initialData = {}) {
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

    /**
     * Writes data to the meta storage.
     *
     * @param {string} key the key to store the data
     * @param {*} value the data to store
     */
    setMeta(key, value) {
        const oldValue = this.#meta.get(key);
        if (oldValue != value) {
            this.#meta.set(key, value);
            const ev = new Event("meta");
            ev.data = {key, value};
            this.dispatchEvent(ev);
        }
    }

    /**
     * Reads data from the meta storage.
     *
     * @param {string} key the key of the data to read
     * @returns {*} the stored data or `undefined`
     */
    getMeta(key) {
        return this.#meta.get(key);
    }

    /**
     * Delete data from the meta storage.
     *
     * @param {string} key the key of the data to delete
     */
    deleteMeta(key) {
        const oldValue = this.#meta.get(key);
        if (oldValue != null) {
            this.#meta.delete(key);
            const ev = new Event("meta");
            ev.data = {key, value: null};
            this.dispatchEvent(ev);
        }
    }

    /**
     * Register an {@link ObservableStorage} or an extended class of it to a specified category if no Storage was previously registered.
     * This can be used to register custom Storages as the default is always {@link ObservableStorage}.
     *
     * If a default Storage has already been used, the registration will try to migrate all the data from the default Storage to the
     * newly registered one by serialization/deserialization.
     *
     * @param {string} category the category to register the storage to (matches [A-Za-z][A-Za-z0-9_]*)
     * @param {ObservableStorage} dataStorage the Storage implementation to register
     * @param {string} eventName the event name to listen to for detecting cchanges (defaults to `change`)
     */
    registerStorage(category, dataStorage, eventName = "change") {
        const storageCategory = category.toString();
        if (!CATEGORY_NAME_REGEX.test(storageCategory)) {
            throw new Error(`failed to retrieve storage "${storageCategory}" - category does not match pattern [A-Za-z][A-Za-z0-9_]*`);
        }
        if (!(dataStorage instanceof ObservableStorage)) {
            throw new TypeError("unknown storage implementation, expected DataStorage");
        }
        if (this.#registeredStorages.has(storageCategory)) {
            throw new Error(`storage with name "${storageCategory}" already registerred`);
        }
        const handler = this.#getChangeHandler(storageCategory);
        if (this.#requestedStorages.has(storageCategory)) {
            const oldStorage = this.#requestedStorages.get(storageCategory);
            oldStorage.removeEventListener("change", handler);
            dataStorage.deserialize(oldStorage.serialize());
            this.#requestedStorages.delete(storageCategory);
        }
        this.#registeredStorages.set(storageCategory, dataStorage);
        this.#eventNames.set(storageCategory, eventName);
        dataStorage.addEventListener(eventName, handler);
        const ev = new Event("register");
        ev.data = {category, dataStorage};
        this.dispatchEvent(ev);
    }

    /**
     * Returns a {@link ObservableStorage} or an extended class of it registered to a specified category.
     *
     * If no {@link ObservableStorage} has been registered, it stores and returns a default Storage.
     *
     * @param {string} category the category for which to get the storage for (matches [A-Za-z][A-Za-z0-9_]* or empty string)
     * @returns {ObservableStorage} the registered Storage or an default Storage
     */
    getStorage(category) {
        const storageCategory = category.toString();
        if (!CATEGORY_NAME_REGEX.test(storageCategory) && storageCategory !== "") {
            throw new Error(`failed to retrieve storage "${storageCategory}" - category does not match pattern [A-Za-z][A-Za-z0-9_]* or empty string`);
        }
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

    /**
     * Write data to the {@link ObservableStorage} represented by its category.
     *
     * @param {string} category the category of the Storage to write the data to
     * @param {string} key the key to store the data
     * @param {*} value the data to store
     */
    set(category, key, value) {
        const dataStorage = this.getStorage(category);
        if (dataStorage != null) {
            if (typeof key == "object") {
                dataStorage.setAll(key);
            } else {
                dataStorage.set(key, value);
            }
        }
    }

    /**
     * Reads data from the {@link ObservableStorage} represented by its category.
     *
     * @param {string} category the category of the Storage to read the data from
     * @param {string} key the key of the data to read
     * @param {*} [def] the default value if no value is present (defaults to `undefined`)
     * @returns {*} the stored data or the default value
     */
    get(category, key, def) {
        const dataStorage = this.getStorage(category);
        if (dataStorage != null) {
            if (dataStorage.has(key)) {
                return dataStorage.get(key);
            }
        }
        return def;
    }

    /**
     * Returns an object representation of the data of all internal {@link ObservableStorage}s.
     *
     * @returns {Object.<string, Object.<string, *>>} an Object containing data of all internal Storages
     */
    getAll() {
        const res = {};
        for (const [category, dataStorage] of this.#registeredStorages) {
            res[category] = dataStorage.getAll();
        }
        for (const [category, dataStorage] of this.#requestedStorages) {
            res[category] = dataStorage.getAll();
        }
        return res;
    }

    /**
     * Returns an object representation of the data of the specified internal {@link ObservableStorage}s.
     *
     * @param {string} categories the categories of the Storages to read the data from
     * @returns {Object.<string, Object.<string, *>>} an Object containing data of the specified internal Storages
     */
    getAllFromCategories(...categories) {
        const res = {};
        for (const category of categories) {
            const dataStorage = this.getStorage(category);
            if (dataStorage != null) {
                res[category] = dataStorage.getAll();
            }
        }
        return res;
    }

    /**
     * Delete data from the {@link ObservableStorage} represented by its category.
     *
     * @param {string} category the category of the Storage to delete the data from
     * @param {string} key the key of the data to delete
     */
    delete(category, key) {
        const dataStorage = this.getStorage(category);
        if (dataStorage != null && dataStorage.has(key)) {
            dataStorage.delete(key);
        }
    }

}
