
import Helper from "../util/helper/Helper.js";

export default class DebouncedStorage extends EventTarget {

    static #debounceTime = 500;

    #debounceTimer;

    #category;

    #state = new Map();

    #changes = new Map();

    static get debounceTime() {
        return this.#debounceTime;
    }

    static set debounceTime(value) {
        value = parseInt(value);
        if (isNaN(value)) {
            throw new TypeError("value must be a number");
        }
        if (value < 0 || value > 60000) {
            throw new RangeError("value must be between 0 and 60000");
        }
        this.#debounceTime = value;
    }

    constructor(category) {
        super();
        this.#category = category;
    }

    #debounceChangeEvent() {
        this.#debounceTimer = undefined;
        const changed = {};
        for (const [key, value] of this.#changes) {
            changed[key] = {
                oldValue: this.#state.get(key),
                newValue: value
            };
            this.#state.set(key, value);
        }
        this.#changes.clear();
        const event = new Event("change");
        event.category = this.#category;
        event.data = changed;
        this.dispatchEvent(event);
    }

    overwrite(data) {
        if (this.#debounceTimer != null) {
            clearTimeout(this.#debounceTimer);
            this.#debounceTimer = undefined;
        }
        this.#state.clear();
        this.#changes.clear();
        for (const key in data) {
            const value = data[key];
            this.#state.set(key, value);
        }
    }

    clear() {
        if (this.#debounceTimer != null) {
            clearTimeout(this.#debounceTimer);
            this.#debounceTimer = undefined;
        }
        for (const [key, value] of this.#state) {
            if (value != null) {
                this.#changes[key] = undefined;
            }
        }
        for (const [key, value] of this.#changes) {
            if (value != null) {
                this.#changes[key] = undefined;
            }
        }
        if (this.#changes.size) {
            this.#debounceTimer = setTimeout(() => {
                this.#debounceChangeEvent();
            }, DebouncedStorage.debounceTime);
        }
        this.#state.clear();
    }

    set(key, value) {
        if (!this.#state.has(key) || !Helper.isEqual(this.#state.get(key), value)) {
            this.#changes.set(key, value);
            // clear timeout
            if (this.#debounceTimer != null) {
                clearTimeout(this.#debounceTimer);
                this.#debounceTimer = undefined;
            }
            // set timeout
            this.#debounceTimer = setTimeout(() => {
                this.#debounceChangeEvent();
            }, DebouncedStorage.debounceTime);
        } else if (this.#changes.has(key)) {
            this.#changes.delete(key);
            // clear timeout
            clearTimeout(this.#debounceTimer);
            this.#debounceTimer = undefined;
            // set timeout
            if (this.#changes.size) {
                this.#debounceTimer = setTimeout(() => {
                    this.#debounceChangeEvent();
                }, DebouncedStorage.debounceTime);
            }
        }
    }

    setAll(data) {
        let changed = false;
        for (const key in data) {
            const value = data[key];
            if (!this.#state.has(key) || !Helper.isEqual(this.#state.get(key), value)) {
                this.#changes.set(key, value);
                changed = true;
            } else if (this.#changes.has(key)) {
                this.#changes.delete(key);
                changed = true;
            }
        }
        if (changed && this.#debounceTimer != null) {
            clearTimeout(this.#debounceTimer);
            this.#debounceTimer = undefined;
        }
        if (this.#changes.size) {
            this.#debounceTimer = setTimeout(() => {
                this.#debounceChangeEvent();
            }, DebouncedStorage.debounceTime);
        }
    }

    get(key) {
        if (this.#changes.has(key)) {
            return this.#changes.get(key);
        } else {
            return this.#state.get(key);
        }
    }

    getAll() {
        const data = {};
        for (const [key, value] of this.#state) {
            data[key] = value;
        }
        for (const [key, value] of this.#changes) {
            data[key] = value;
        }
        return data;
    }

    has(key) {
        if (this.#changes.has(key) || this.#state.has(key)) {
            return true;
        } else {
            return false;
        }
    }

    clearImmediate() {
        const changed = {};
        for (const [key, value] of this.#state) {
            if (value != null) {
                changed[key] = {
                    oldValue: this.#state.get(key),
                    newValue: value
                };
            }
        }
        this.#state.clear();
        this.#changes.clear();
        if (this.#debounceTimer != null) {
            clearTimeout(this.#debounceTimer);
            this.#debounceTimer = undefined;
        }
        if (Object.keys(changed).length) {
            const event = new Event("change");
            event.category = this.#category;
            event.data = changed;
            this.dispatchEvent(event);
        }
    }

    setImmediate(key, current, change) {
        if (this.#debounceTimer != null) {
            this.#state.set(key, current);
            if (!Helper.isEqual(current, change)) {
                this.#changes.set(key, change);
            } else if (this.#changes.has(key)) {
                this.#changes.delete(key);
                if (!this.#changes.size) {
                    clearTimeout(this.#debounceTimer);
                    this.#debounceTimer = undefined;
                }
            }
        } else if (!this.#state.has(key) || !Helper.isEqual(this.#state.get(key), change)) {
            const changed = {};
            changed[key] = {
                oldValue: this.#state.get(key),
                newValue: change
            };
            this.#state.set(key, change);
            const event = new Event("change");
            event.category = this.#category;
            event.data = changed;
            this.dispatchEvent(event);
        }
    }

    getImmediate(key) {
        return this.#state.get(key);
    }

    setImmediateAll(data) {
        if (this.#debounceTimer != null) {
            for (const key in data) {
                const {current, change} = data[key];
                this.#state.set(key, current);
                if (!Helper.isEqual(current, change)) {
                    this.#changes.set(key, change);
                } else if (this.#changes.has(key)) {
                    this.#changes.delete(key);
                }
            }
            if (!this.#changes.size) {
                clearTimeout(this.#debounceTimer);
                this.#debounceTimer = undefined;
            }
        } else {
            const changed = {};
            for (const key in data) {
                const {change} = data[key];
                if (!this.#state.has(key) || !Helper.isEqual(this.#state.get(key), change)) {
                    changed[key] = {
                        oldValue: this.#state.get(key),
                        newValue: change
                    };
                    this.#state.set(key, change);
                }
            }
            if (Object.keys(changed).length) {
                const event = new Event("change");
                event.category = this.#category;
                event.data = changed;
                this.dispatchEvent(event);
            }
        }
    }

}
