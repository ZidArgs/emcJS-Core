import {isEqual} from "../../../util/helper/Comparator.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {jsonParseSafe} from "../../../util/helper/JSON.js";

const STORAGE = new Map();

class LocalStorage extends EventTarget {

    #read(key) {
        const res = localStorage.getItem(key);
        return jsonParseSafe(res);
    }

    #write(key, value) {
        try {
            if (value == null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch {
            return;
        }
    }

    constructor() {
        super();
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            const value = this.#read(key);
            if (value != null) {
                STORAGE.set(key, value);
            }
        }
        // event
        window.addEventListener("storage", (event) => {
            const {
                key, newValue, storageArea
            } = event;
            if (storageArea === localStorage) {
                if (key == null) {
                    STORAGE.clear();
                } else if (newValue == null) {
                    STORAGE.delete(key);
                } else {
                    STORAGE.set(key, jsonParseSafe(newValue));
                }
            }
        });
    }

    set(key, value) {
        const oldValue = STORAGE.get(key);
        if (!isEqual(oldValue, value)) {
            STORAGE.set(key, value);
            this.#write(key, value);
        }
    }

    get(key, value) {
        return STORAGE.get(key) ?? value;
    }

    has(key) {
        return STORAGE.has(key);
    }

    delete(key) {
        const oldValue = STORAGE.get(key);
        if (oldValue != null) {
            STORAGE.delete(key);
            this.#write(key);
        }
    }

    clear() {
        localStorage.clear();
        STORAGE.clear();
    }

    keys() {
        return STORAGE.keys();
    }

    setAll(values) {
        for (const key in values) {
            const oldValue = STORAGE.get(key);
            const value = values[key];
            if (!isEqual(oldValue, value)) {
                STORAGE.set(key, value);
                this.#write(key, value);
            }
        }
    }

    getAll() {
        const res = {};
        for (const [key, value] of STORAGE) {
            res[key] = deepClone(value);
        }
        return res;
    }

}

export default new LocalStorage;
