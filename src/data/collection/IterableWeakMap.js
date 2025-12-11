class IterableWeakMapIterator extends Iterator {

    #values = [];

    constructor(values) {
        super();
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "IterableWeakMap Iterator",
            configurable: true,
            enumerable: false,
            writable: false
        });

        delete this.prototype.constructor;
    }

    next() {
        if (this.#values.length) {
            const value = this.#values.shift();
            return {
                value: value,
                done: false
            };
        }
        return {
            value: undefined,
            done: true
        };
    }

}

export default class IterableWeakMap {

    #iterable = new Map();

    #index = new WeakMap();

    get size() {
        for (const [ref] of this.#iterable) {
            const key = ref.deref();
            if (key == null) {
                this.#iterable.delete(ref);
            }
        }
        return this.#iterable.size;
    }

    set(key, value) {
        const ref = this.#index.get(key);
        if (ref?.deref() != null) {
            this.#iterable.set(ref, value);
        } else {
            const ref = new WeakRef(key);
            this.#index.set(key, ref);
            this.#iterable.set(ref, value);
        }
        return this;
    }

    get(key) {
        const ref = this.#index.get(key);
        if (ref?.deref() != null) {
            return this.#iterable.get(ref);
        }
        return null;
    }

    has(key) {
        const ref = this.#index.get(key);
        if (ref?.deref() != null) {
            return this.#iterable.has(ref);
        }
        return false;
    }

    delete(key) {
        const ref = this.#index.get(key);
        if (ref != null) {
            this.#index.delete(key);
            this.#iterable.delete(ref);
        }
        return this;
    }

    clear() {
        this.#index = new WeakMap();
        this.#iterable.clear();
        return this;
    }

    keys() {
        return new IterableWeakMapIterator(this.#getKeys());
    }

    values() {
        return new IterableWeakMapIterator(this.#getValues());
    }

    entries() {
        return new IterableWeakMapIterator(this.#getEntries());
    }

    forEach(callbackFn, thisArg) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (const [ref, value] of this.#iterable) {
            const key = ref.deref();
            if (key != null) {
                callbackFn.call(thisArg, value, key, this);
            } else {
                this.#iterable.delete(ref);
            }
        }
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    #getKeys() {
        const result = [];
        for (const [ref] of this.#iterable) {
            const key = ref.deref();
            if (key != null) {
                result.push(key);
            } else {
                this.#iterable.delete(ref);
            }
        }
        return result;
    }

    #getValues() {
        const result = [];
        for (const [ref, value] of this.#iterable) {
            const key = ref.deref();
            if (key != null) {
                result.push(value);
            } else {
                this.#iterable.delete(ref);
            }
        }
        return result;
    }

    #getEntries() {
        const result = [];
        for (const [ref, value] of this.#iterable) {
            const key = ref.deref();
            if (key != null) {
                result.push([key, value]);
            } else {
                this.#iterable.delete(ref);
            }
        }
        return result;
    }

}
