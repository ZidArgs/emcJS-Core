
import DataStorage from "./DataStorage.js";

const DEFAULTS = new WeakMap();

export default class DefaultingStorage extends DataStorage {

    constructor() {
        super();
        const defaults = new Map();
        DEFAULTS.set(this, defaults);
    }

    setDefault(key, value) {
        const defaults = DEFAULTS.get(this);
        const old = defaults.get(key);
        if (old != value) {
            defaults.set(key, value);
            if (!super.has(key)) {
                const ev = new Event("change");
                ev.data = {[key]: value};
                this.dispatchEvent(ev);
            }
        }
    }

    getDefault(key) {
        const defaults = DEFAULTS.get(this);
        return defaults.get(key);
    }

    resetValue(key) {
        const defaults = DEFAULTS.get(this);
        const value = defaults.get(key);
        super.set(key, value);
    }

    set(key, value) {
        const defaults = DEFAULTS.get(this);
        if (defaults.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const defaults = DEFAULTS.get(this);
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (defaults.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        const defaults = DEFAULTS.get(this);
        if (defaults.has(key)) {
            return super.get(key, defaults.get(key));
        }
    }

    getAll() {
        const defaults = DEFAULTS.get(this);
        const res = {};
        for (const [key, value] of defaults) {
            res[key] = super.get(key, value);
        }
        return res;
    }

    has(key) {
        const defaults = DEFAULTS.get(this);
        return defaults.has(key);
    }

    keys() {
        const defaults = DEFAULTS.get(this);
        return defaults.keys();
    }

    deserialize(data = {}) {
        const defaults = DEFAULTS.get(this);
        const res = {};
        for (const [key] of defaults) {
            const newValue = data[key];
            if (newValue != null) {
                res[key] = newValue;
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const defaults = DEFAULTS.get(this);
        const res = {};
        for (const [key] of defaults) {
            const newValue = data[key];
            res[key] = newValue;
        }
        super.overwrite(res);
    }

}
