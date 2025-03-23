import {debounce} from "../../util/Debouncer.js";

export default class UsageCounter extends EventTarget {

    #data = new Map();

    #notifyChange = debounce(() => {
        this.dispatchEvent(new Event("change"));
    });

    increase(value) {
        if (!this.#data.has(value)) {
            this.#data.set(value, 1);
            this.#notifyChange();
            return true;
        }
        const oldValue = this.#data.get(value);
        this.#data.set(value, oldValue + 1);
        this.#notifyChange();
        return false;
    }

    decrease(value) {
        const oldValue = this.#data.get(value);
        if (oldValue == null) {
            return false;
        }
        if (oldValue <= 1) {
            this.#data.delete(value);
            this.#notifyChange();
            return true;
        }
        this.#data.set(value, oldValue - 1);
        this.#notifyChange();
        return false;
    }

    clear() {
        if (this.#data.size) {
            this.#data.clear();
            this.#notifyChange();
        }
    }

    has(key) {
        return this.#data.has(key);
    }

    all() {
        return Array.from(this.#data.keys());
    }

    getUsage(key) {
        return this.#data.get(key);
    }

    getAllUsages() {
        const res = {};
        for (const [key, value] of this.#data) {
            res[key] = value;
        }
        return res;
    }

}
