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
        return this;
    }

    delete(value) {
        if (this.#data.delete(value)) {
            this.#notifyChange();
            return true;
        }
        return false;
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

    forEach(callbackFn, thisArg) {
        this.#data.forEach((value, key) => {
            callbackFn.call(thisArg, value, key, this);
        });
    }

    difference(other) {
        return this.#data.difference(other);
    }

    intersection(other) {
        return this.#data.intersection(other);
    }

    isDisjointFrom(other) {
        return this.#data.isDisjointFrom(other);
    }

    isSubsetOf(other) {
        return this.#data.isSubsetOf(other);
    }

    isSupersetOf(other) {
        return this.#data.isSupersetOf(other);
    }

    symmetricDifference(other) {
        return this.#data.symmetricDifference(other);
    }

    union(other) {
        return this.#data.union(other);
    }

}
