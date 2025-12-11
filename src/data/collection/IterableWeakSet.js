class IterableWeakSetIterator extends Iterator {

    #values = [];

    constructor(values) {
        super();
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "IterableWeakSet Iterator",
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

export default class IterableWeakSet {

    #iterable = new Set();

    #index = new WeakMap();

    get size() {
        for (const ref of this.#iterable) {
            const value = ref.deref();
            if (value == null) {
                this.#iterable.delete(ref);
            }
        }
        return this.#iterable.size;
    }

    add(value) {
        const ref = this.#index.get(value);
        if (ref?.deref() == null) {
            const ref = new WeakRef(value);
            this.#index.set(value, ref);
            this.#iterable.add(ref);
        }
        return this;
    }

    get(value) {
        const ref = this.#index.get(value);
        return ref?.deref();
    }

    has(value) {
        const ref = this.#index.get(value);
        if (ref != null) {
            return true;
        }
        return false;
    }

    delete(value) {
        const ref = this.#index.get(value);
        if (ref != null) {
            this.#index.delete(value);
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
        return this.values();
    }

    values() {
        return new IterableWeakSetIterator(this.#getValues());
    }

    entries() {
        return new IterableWeakSetIterator(this.#getEntries());
    }

    forEach(callbackFn, thisArg) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (const ref of this.#iterable) {
            const value = ref.deref();
            if (value != null) {
                callbackFn.call(thisArg, value, value, this);
            } else {
                this.#iterable.delete(ref);
            }
        }
    }

    [Symbol.iterator]() {
        return this.values();
    }

    #getValues() {
        const result = [];
        for (const ref of this.#iterable) {
            const value = ref.deref();
            if (value != null) {
                result.push(value);
            } else {
                this.#iterable.delete(ref);
            }
        }
        return result;
    }

    #getEntries() {
        const result = [];
        for (const [ref] of this.#iterable) {
            const value = ref.deref();
            if (value != null) {
                result.push([value, value]);
            } else {
                this.#iterable.delete(ref);
            }
        }
        return result;
    }

}
