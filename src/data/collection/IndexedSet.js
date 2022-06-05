class IndexedSetIterator {

    #values;

    #pseudoKey;

    constructor(values, pseudoKey = false) {
        this.#values = Array.from(values);
        this.#pseudoKey = pseudoKey;
    }

    next() {
        if (this.#values.length) {
            const value = this.#values.shift();
            return {
                value: this.#pseudoKey ? [value, value] : value,
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
            if (typeof iterable[Symbol.iterator] !== "function") {
                throw new TypeError("parameter must be iterable or undefined");
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

    delete(value) {
        const index = this.#values.indexOf(value);
        if (index >= 0) {
            this.#values = [
                ...this.#values.slice(0, index),
                ...this.#values.slice(index + 1)
            ];
            return true;
        }
        return false;
    }

    clear() {
        this.#values = [];
    }

    has(value) {
        return this.#values.includes(value);
    }

    values() {
        return new IndexedSetIterator(this.#values);
    }

    entries() {
        return new IndexedSetIterator(this.#values, true);
    }

    forEach(callback, thisArg = this) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (const value of this.#values) {
            callback.call(thisArg, value, value, this);
        }
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

    [Symbol.iterator]() {
        return this.#values[Symbol.iterator]();
    }

}
