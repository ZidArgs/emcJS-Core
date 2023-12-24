class IndexedSetIterator {

    #values;

    #withKey;

    constructor(values, withKey = false) {
        this.#values = Array.from(values);
        this.#withKey = withKey;
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "Indexed Set Iterator",
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
                value: this.#withKey ? [value, value] : value,
                done: false
            }
        }
        return {
            value: undefined,
            done: true
        }
    }

}

export default class IndexedSet {

    #values = [];

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
        return this.#values.length;
    }

    add(value) {
        const index = this.#values.indexOf(value);
        if (index >= 0) {
            this.#values = [
                ...this.#values.slice(0, index),
                ...this.#values.slice(index + 1),
                value
            ];
        } else {
            this.#values.push(value);
        }
        return this;
    }

    insert(value, pos) {
        const index = this.#values.indexOf(value);
        let values = this.#values;
        if (index >= 0) {
            values = [
                ...values.slice(0, index),
                ...values.slice(index + 1)
            ];
        }
        if (pos === 0) {
            this.#values = [
                value,
                ...values
            ];
        } else if (pos >= values.length) {
            this.#values = [
                ...values,
                value
            ];
        } else {
            this.#values = [
                ...values.slice(0, pos - 1),
                value,
                ...values.slice(pos)
            ];
        }
        return this;
    }

    delete(value) {
        const index = this.#values.indexOf(value);
        if (index >= 0) {
            this.#values = [
                ...this.#values.slice(0, index),
                ...this.#values.slice(index + 1)
            ];
        }
        return this;
    }

    clear() {
        this.#values = [];
        return this;
    }

    has(value) {
        return this.#values.includes(value);
    }

    keys() {
        return new IndexedSetIterator(this.#values);
    }

    values() {
        return new IndexedSetIterator(this.#values);
    }

    entries() {
        return new IndexedSetIterator(this.#values, true);
    }

    forEach(callback, thisArg) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (let index = 0; index < this.#values.length; ++index) {
            const value = this.#values[index];
            callback.call(thisArg, value, index, this);
        }
    }

    filter(callback, thisArg) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        return new IndexedSet(this.#values.filter((value, index) => {
            return callback.call(thisArg, value, index, this);
        }));
    }

    at(index) {
        return this.#values.at(index);
    }

    first() {
        return this.#values.at(0);
    }

    last() {
        return this.#values.at(-1);
    }

    pop() {
        return this.#values.pop();
    }

    shift() {
        return this.#values.shift();
    }

    reverse() {
        this.#values.reverse();
        return this;
    }

    slice(start, end) {
        return new IndexedSet(this.#values.slice(start, end));
    }

    indexOf(value) {
        return this.#values.indexOf(value);
    }

    [Symbol.iterator]() {
        return new IndexedSetIterator(this.#values);
    }

}
