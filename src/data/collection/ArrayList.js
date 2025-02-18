class ArrayListIterator extends Iterator {

    #values;

    constructor(values) {
        super();
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "ArraList Iterator",
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

// TODO implement ArrayList
/*
clone() - Returns a shallow copy of this ArrayList instance.
*/
export default class ArrayList {

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

    isEmpty() {
        return this.#values.length === 0;
    }

    add(...values) {
        this.#values.push(...values);
        return this;
    }

    insertAt(pos = 0, ...values) {
        this.#values.splice(pos, 0, ...values);
        return this;
    }

    set(pos = 0, ...values) {
        this.#values.splice(pos, values.length, ...values);
        return this;
    }

    remove(...values) {
        for (const value of values) {
            const index = this.#values.indexOf(value);
            if (index >= 0) {
                this.#values.splice(index, 1);
            }
        }
        return this;
    }

    removeAt(pos = 0) {
        this.#values.splice(pos, 1);
        return this;
    }

    removeRange(pos = 0, length = 1) {
        this.#values.splice(pos, length);
        return this;
    }

    clear() {
        this.#values = [];
        return this;
    }

    contains(value) {
        return this.#values.includes(value);
    }

    keys() {
        return new ArrayListIterator(this.#values.keys());
    }

    values() {
        return new ArrayListIterator(this.#values.values());
    }

    entries() {
        return new ArrayListIterator(this.#values.entries());
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
        return new ArrayList(this.#values.filter((value, index) => {
            return callback.call(thisArg, value, index, this);
        }));
    }

    sort(callback) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        this.#values.sort(callback);
        return this;
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
        return new ArrayList(this.#values.slice(start, end));
    }

    indexOf(value) {
        return this.#values.indexOf(value);
    }

    toArray() {
        return [...this.#values];
    }

    [Symbol.iterator]() {
        return new ArrayListIterator(this.#values);
    }

}
