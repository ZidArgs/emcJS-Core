class OrderedMapIterator extends Iterator {

    #values = [];

    constructor(values) {
        super();
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "OrderedMap Iterator",
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

export default class OrderedMap {

    #values = new Map();

    #index = [];

    constructor(iterable) {
        if (iterable != null) {
            if (!Array.isArray(iterable) && typeof iterable[Symbol.iterator] !== "function") {
                throw new TypeError("parameter must be array, iterable or undefined");
            }
            for (const value of iterable) {
                this.#values.push(value);
            }
        }
    }

    get size() {
        return this.#values.size;
    }

    set(key, value) {
        const index = this.#index.indexOf(key);
        if (index < 0) {
            this.#index.push(key);
        }
        this.#values.set(key, value);
        return this;
    }

    insertAt(pos, key, value) {
        pos = parseInt(pos);
        if (isNaN(pos)) {
            throw new TypeError("pos must be a number");
        }
        const index = this.#index.indexOf(key);
        if (index >= 0) {
            this.#index.splice(index, 1);
        }
        this.#index.splice(pos, 0, key);
        this.#values.set(key, value);
        return this;
    }

    delete(key) {
        const index = this.#index.indexOf(key);
        if (index >= 0) {
            this.#index.splice(index, 1);
        }
        this.#values.delete(key);
        return this;
    }

    clear() {
        this.#index = [];
        this.#values.clear();
        return this;
    }

    has(value) {
        return this.#values.has(value);
    }

    keys() {
        return new OrderedMapIterator(this.#index);
    }

    values() {
        return new OrderedMapIterator(this.#getValues());
    }

    entries() {
        return new OrderedMapIterator(this.#getEntries());
    }

    forEach(callbackFn, thisArg) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (const key of this.#index) {
            const value = this.#values.get(key);
            callbackFn.call(thisArg, value, key, this);
        }
    }

    at(pos) {
        pos = parseInt(pos);
        if (isNaN(pos)) {
            throw new TypeError("pos must be a number");
        }
        const key = this.#index.at(pos);
        return this.#values.get(key);
    }

    first() {
        const key = this.#index.at(0);
        return this.#values.get(key);
    }

    last() {
        const key = this.#index.at(-1);
        return this.#values.get(key);
    }

    reverse() {
        this.#index.reverse();
        return this;
    }

    indexOf(key) {
        return this.#index.indexOf(key);
    }

    [Symbol.iterator]() {
        return new OrderedMapIterator(this.#getEntries());
    }

    #getValues() {
        const result = [];
        for (const key of this.#index) {
            const value = this.#values.get(key);
            result.push(value);
        }
        return result;
    }

    #getEntries() {
        const result = [];
        for (const key of this.#index) {
            const value = this.#values.get(key);
            result.push([value, key]);
        }
        return result;
    }

}
