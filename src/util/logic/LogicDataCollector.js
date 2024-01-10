import {
    debounce, debounceCacheData
} from "../Debouncer.js";
import MapLocker from "../../data/locker/MapLocker.js";
import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js"

export default class LogicDataCollector extends EventTarget {

    #storageRegister = new Map();

    #augments = new Set();

    #cache = new Map();

    #cacheLock = new MapLocker(this.#cache);

    #data = new Map();

    #eventManager = new EventMultiTargetManager();

    constructor() {
        super();
        /* EVENTS */
        this.#eventManager.set(["load", "clear", "change"], (event) => {
            const storage = event.target;
            const {prefix, postfix, precall} = this.#storageRegister.get(storage);
            const data = event.data;
            if (typeof precall === "function") {
                this.#changeData(this.#renameKeys(precall(data), prefix, postfix));
            } else {
                this.#changeData(this.#renameKeys(data, prefix, postfix));
            }
        });
    }

    #init = debounce(() => {
        const logicData = {};
        for (const [storage, {prefix, postfix, precall}] of this.#storageRegister) {
            const data = storage.getAll();
            if (typeof precall === "function") {
                this.#addRenameKeys(logicData, precall(data), prefix, postfix);
            } else {
                this.#addRenameKeys(logicData, data, prefix, postfix);
            }
        }
        // ---
        this.#cache.clear();
        for (const [key, value] of Object.entries(logicData)) {
            this.#cache.set(key, value);
        }
        const augmentedData = this.#execAugment(logicData);
        for (const [key, value] of Object.entries(augmentedData)) {
            this.#data.set(key, value);
        }
        const ev = new Event("load");
        this.dispatchEvent(ev);
    });

    #changeData = debounceCacheData((newData) => {
        const changes = {};
        for (const data of newData) {
            for (const [key, value] of Object.entries(data)) {
                const oldValue = this.#cache.get(key);
                if (oldValue != value) {
                    changes[key] = value;
                    this.#cache.set(key, value);
                }
            }
        }
        if (Object.keys(changes).length > 0) {
            const augmentedData = this.#execAugment(changes);
            for (const [key, value] of Object.entries(augmentedData)) {
                this.#data.set(key, value);
            }
            const ev = new Event("change");
            this.dispatchEvent(ev);
        }
    });

    get(key) {
        return this.#data.get(key);
    }

    registerStorage(storage, prefix = "", postfix = "", precall = null) {
        if (!(storage instanceof ObservableStorage)) {
            throw new TypeError("storage must be ObservableStorage");
        }
        this.#eventManager.addTarget(storage);
        this.#storageRegister.set(storage, {prefix, postfix, precall});
        this.#init();
    }

    unregisterStorage(storage) {
        if (!(storage instanceof ObservableStorage)) {
            throw new TypeError("storage must be ObservableStorage");
        }
        this.#eventManager.removeTarget(storage);
        this.#storageRegister.delete(storage);
        this.#init();
    }

    registerAugment(augment) {
        if (typeof augment != "function") {
            throw new TypeError(`augment parameter must be of type "function" but was "${typeof ref}"`);
        }
        if (!this.#augments.has(augment)) {
            this.#augments.add(augment);
            this.#init();
        }
    }

    unregisterAugment(augment) {
        if (typeof augment != "function") {
            throw new TypeError(`augment parameter must be of type "function" but was "${typeof ref}"`);
        }
        if (this.#augments.has(augment)) {
            this.#augments.delete(augment);
            this.#init();
        }
    }

    #execAugment(data) {
        for (const augment of this.#augments) {
            const res = augment(this.#cacheLock, data);
            data = {...data, ...res};
        }
        return data;
    }

    #renameKeys(src = {}, prefix = "", postfix = "") {
        const res = {};
        for (const [key, value] of Object.entries(src)) {
            res[`${prefix}${key}${postfix}`] = value;
        }
        return res;
    }

    #addRenameKeys(target = {}, source = {}, prefix = "", postfix = "") {
        for (const [key, value] of Object.entries(source)) {
            target[`${prefix}${key}${postfix}`] = value;
        }
        return target;
    }

}
