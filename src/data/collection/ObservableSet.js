import {
    debounce
} from "../../util/Debouncer.js";

export default class ObservableSet extends EventTarget {

    #data = new Set();

    #notifyChange = debounce(() => {
        this.dispatchEvent(new Event("change"));
    });

    add(value) {
        if (!this.#data.has(value)) {
            this.#data.add(value);
            this.#notifyChange();
        }
    }

    delete(value) {
        if (this.#data.has(value)) {
            this.#data.delete(value);
            this.#notifyChange();
        }
    }

    clear() {
        if (this.#data.size) {
            this.#data.clear();
            this.#notifyChange();
        }
    }

    get size() {
        return this.#data.size;
    }

    has(key) {
        return this.#data.has(key);
    }

    keys() {
        return this.#data.keys();
    }

    values() {
        return this.#data.values();
    }

    entries() {
        return this.#data.entries();
    }

    [Symbol.iterator]() {
        return this.#data[Symbol.iterator]();
    }

}
