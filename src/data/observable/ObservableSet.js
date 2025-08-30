import {debounceCacheData} from "../../util/Debouncer.js";

export default class ObservableSet extends EventTarget {

    #data = new Set();

    #notifyChange = debounceCacheData((data) => {
        const changes = {
            added: new Set(),
            removed: new Set()
        };
        for (const [entry] of data) {
            const {
                type, value
            } = entry;
            if (type === "add") {
                if (changes.removed.has(value)) {
                    changes.removed.delete(value);
                } else {
                    changes.added.add(value);
                }
            } else if (type === "delete") {
                if (changes.added.has(value)) {
                    changes.added.delete(value);
                } else {
                    changes.removed.add(value);
                }
            } else if (type === "clear") {
                changes.added.clear(value);
                for (const key of value) {
                    changes.removed.add(key);
                }
            }
        }
        // ---
        const ev = new Event("change");
        ev.data = {
            added: [...changes.added],
            removed: [...changes.removed]
        };
        this.dispatchEvent(ev);
    });

    add(value) {
        if (!this.#data.has(value)) {
            this.#data.add(value);
            this.#notifyChange({
                type: "add",
                value
            });
        }
        return this;
    }

    delete(value) {
        if (this.#data.delete(value)) {
            this.#notifyChange({
                type: "delete",
                value
            });
            return true;
        }
        return false;
    }

    clear() {
        if (this.#data.size) {
            const value = [...this.#data];
            this.#data.clear();
            this.#notifyChange({
                type: "clear",
                value
            });
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
