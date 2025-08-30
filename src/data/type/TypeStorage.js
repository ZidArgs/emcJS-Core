import {debounceCacheData} from "../../util/Debouncer.js";
import {isEqual} from "../../util/helper/Comparator.js";
import {deepClone} from "../../util/helper/DeepClone.js";
import TypeValidator from "../../util/type/TypeValidator.js";

const REGISTER_LISTENER = new Set();

const STORAGES = new Map();

// TODO create custom error type including error data
export default class TypeStorage extends EventTarget {

    #typeName;

    #rootData = new Map();

    #changeData = new Map();

    #buffer = new Map();

    #errorData = new Map();

    get size() {
        return this.#buffer.size;
    }

    constructor(typeName) {
        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`typeName has to be a string that is not empty and not "*"`);
        }
        if (STORAGES.has(typeName)) {
            return STORAGES.get(typeName);
        }
        super();
        this.#typeName = typeName;
        STORAGES.set(typeName, this);
        TypeStorage.#callListeners(typeName);
    }

    get typeName() {
        return this.#typeName;
    }

    set(key, value) {
        if (value == null) {
            return;
        }
        // validation
        if (Object.keys(value).length) {
            const validationErrors = TypeValidator.validate(this.#typeName, value, {label: key});
            if (validationErrors.length > 0) {
                const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
                this.#errorData.set(key, {
                    value: deepClone(value),
                    error: msg
                });
                throw new Error(`Error validating value as "${this.#typeName}"\n    ${msg}`);
            }
            this.#errorData.delete(key);
        }
        // write
        const oldValue = this.get(key);
        if (!isEqual(oldValue, value)) {
            const clonedValue = deepClone(value);
            this.#writeChangeData(key, clonedValue);
            this.#buffer.set(key, clonedValue);
            // event
            const ev = new Event("change");
            ev.data = {[key]: value};
            ev.changes = {
                [key]: {
                    oldValue,
                    newValue: value
                }
            };
            this.dispatchEvent(ev);
        }
    }

    setAll(data) {
        const allErrors = [];
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            if (newValue == null) {
                continue;
            }
            // validation
            if (Object.keys(newValue).length) {
                const validationErrors = TypeValidator.validate(this.#typeName, newValue, {label: key});
                if (validationErrors.length > 0) {
                    const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
                    this.#errorData.set(key, {
                        value: deepClone(newValue),
                        error: msg
                    });
                    allErrors.push(`Error validating value as "${this.#typeName}"\n    ${msg}`);
                    continue;
                }
                this.#errorData.delete(key);
            }
            // write
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                const clonedValue = deepClone(newValue);
                this.#writeChangeData(key, clonedValue);
                this.#buffer.set(key, clonedValue);
                values[key] = newValue;
                changes[key] = {
                    oldValue,
                    newValue
                };
            }
        }
        // event
        if (Object.keys(values).length) {
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
        // errors
        if (allErrors.length) {
            const msg = allErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error validating data\n    ${msg}`);
        }
    }

    get(key) {
        if (this.#buffer.has(key)) {
            return deepClone(this.#buffer.get(key));
        }
        return null;
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#buffer) {
            res[key] = deepClone(value);
        }
        return res;
    }

    delete(key) {
        const oldValue = this.#buffer.get(key);
        if (oldValue != null) {
            this.#writeChangeData(key);
            this.#buffer.delete(key);
            const ev = new Event("change");
            ev.data = {[key]: undefined};
            ev.changes = {
                [key]: {
                    oldValue,
                    newValue: undefined
                }
            };
            this.dispatchEvent(ev);
        }
    }

    has(key) {
        return this.#buffer.has(key);
    }

    keys() {
        return this.#buffer.keys();
    }

    clear() {
        this.#rootData.clear();
        this.#changeData.clear();
        this.#buffer.clear();
        const ev = new Event("clear");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    serialize() {
        return this.getAll();
    }

    deserialize(data = {}) {
        const allErrors = [];
        this.#rootData.clear();
        this.#changeData.clear();
        this.#buffer.clear();
        for (const key in data) {
            const newValue = data[key];
            if (newValue == null) {
                continue;
            }
            // validation
            if (Object.keys(newValue).length) {
                const validationErrors = TypeValidator.validate(this.#typeName, newValue, {label: key});
                if (validationErrors.length > 0) {
                    const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
                    this.#errorData.set(key, {
                        value: deepClone(newValue),
                        error: msg
                    });
                    allErrors.push(`Error validating value as "${this.#typeName}"\n    ${msg}`);
                    continue;
                }
                this.#errorData.delete(key);
            }
            // write
            const clonedValue = deepClone(newValue);
            this.#rootData.set(key, clonedValue);
            this.#buffer.set(key, clonedValue);
        }
        // event
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
        // errors
        if (allErrors.length) {
            const msg = allErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error validating data\n    ${msg}`);
        }
    }

    overwrite(data = {}) {
        const allErrors = [];
        const values = {};
        const changes = {};
        for (const key in data) {
            const newValue = data[key];
            // validation
            if (newValue != null && Object.keys(newValue).length) {
                const validationErrors = TypeValidator.validate(this.#typeName, newValue, {label: key});
                if (validationErrors.length > 0) {
                    const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
                    this.#errorData.set(key, {
                        value: deepClone(newValue),
                        error: msg
                    });
                    allErrors.push(`Error validating value as "${this.#typeName}"\n    ${msg}`);
                    continue;
                }
                this.#errorData.delete(key);
            }
            // write
            const oldValue = this.get(key);
            if (!isEqual(oldValue, newValue)) {
                if (newValue == null) {
                    this.#buffer.delete(key);
                    this.#writeChangeData(key);
                    values[key] = undefined;
                    changes[key] = {
                        oldValue,
                        newValue: undefined
                    };
                } else {
                    const clonedValue = deepClone(newValue);
                    this.#buffer.set(key, clonedValue);
                    this.#writeChangeData(key, clonedValue);
                    values[key] = newValue;
                    changes[key] = {
                        oldValue,
                        newValue
                    };
                }
            }
        }
        // event
        if (Object.keys(values).length) {
            const ev = new Event("change");
            ev.data = values;
            ev.changes = changes;
            this.dispatchEvent(ev);
        }
        // errors
        if (allErrors.length) {
            const msg = allErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error validating data\n    ${msg}`);
        }
    }

    static getStorage(typeName) {
        if (typeName == null) {
            return null;
        }
        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`typeName has to be a string that is not empty and not "*"`);
        }
        if (STORAGES.has(typeName)) {
            return STORAGES.get(typeName);
        }
    }

    static getAllStorageNames() {
        return [...STORAGES.keys()];
    }

    static onStorageRegister(callback) {
        if (typeof callback === "function") {
            REGISTER_LISTENER.add(callback);
        }
    }

    static unStorageRegister(callback) {
        if (typeof callback === "function") {
            REGISTER_LISTENER.delete(callback);
        }
    }

    static #callListeners = debounceCacheData((typeNames) => {
        for (const [listener] of REGISTER_LISTENER) {
            listener(typeNames);
        }
    });

    getRootValue(key) {
        return this.#rootData.get(key);
    }

    hasChanges() {
        return this.#changeData.size > 0;
    }

    getChanges() {
        const res = {};
        for (const [key, value] of this.#changeData) {
            res[key] = value;
        }
        return res;
    }

    flushChanges() {
        for (const [key, value] of this.#changeData) {
            if (value == null) {
                this.#rootData.delete(key);
            } else {
                this.#rootData.set(key, value);
            }
        }
        this.#changeData.clear();
    }

    resetValueChange(key) {
        const oldValue = this.#buffer.get(key);
        if (this.#rootData.has(key)) {
            const newValue = this.#rootData.get(key);
            this.#buffer.set(key, newValue);
        } else {
            this.#buffer.delete(key);
        }
        this.#changeData.delete(key);
        const defaultValue = this.getDefault(key);
        const ev = new Event("change");
        ev.data = {[key]: defaultValue};
        ev.changes = {
            [key]: {
                oldValue,
                newValue: defaultValue
            }
        };
        this.dispatchEvent(ev);
    }

    purgeChanges() {
        for (const [key] of this.#changeData) {
            if (this.#rootData.has(key)) {
                const newValue = this.#rootData.get(key);
                this.#buffer.set(key, newValue);
            } else {
                this.#buffer.delete(key);
            }
        }
        this.#changeData.clear();
        const ev = new Event("load");
        ev.data = this.getAll();
        this.dispatchEvent(ev);
    }

    [Symbol.iterator]() {
        return this.#buffer[Symbol.iterator]();
    }

    #writeChangeData(key, value = null) {
        if (this.#rootData.get(key) === value) {
            this.#changeData.delete(key);
        } else {
            this.#changeData.set(key, value);
        }
    }

    getErrorData() {
        const res = {};
        for (const [key, data] of this.#errorData) {
            const {
                value, error
            } = data;
            res[key] = {
                value,
                error
            };
        }
        return res;
    }

    clearErrors() {
        this.#errorData.clear();
    }

}
