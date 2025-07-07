class ArraySetIterator extends Iterator {

    #values;

    constructor(values) {
        super();
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "ArraySet Iterator",
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

export default class ArraySet {

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

    add(...values) {
        for (const value of values) {
            const index = this.#values.indexOf(value);
            if (index >= 0) {
                this.#values.splice(index, 1);
            }
        }
        this.#values.push(...values);
        return this;
    }

    insertAt(pos, ...values) {
        pos = parseInt(pos);
        if (isNaN(pos)) {
            throw new TypeError("pos must be a number");
        }
        for (const value of values) {
            const index = this.#values.indexOf(value);
            if (index >= 0) {
                this.#values.splice(index, 1);
            }
        }
        this.#values.splice(pos, 0, ...values);
        return this;
    }

    delete(...values) {
        for (const value of values) {
            const index = this.#values.indexOf(value);
            if (index >= 0) {
                this.#values.splice(index, 1);
            }
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
        return new ArraySetIterator(this.#values);
    }

    values() {
        return new ArraySetIterator(this.#values);
    }

    entries() {
        return new ArraySetIterator(this.#values.map((entry) => [entry, entry]));
    }

    forEach(callbackFn, thisArg) {
        if (typeof callbackFn !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (let index = 0; index < this.#values.length; ++index) {
            const value = this.#values[index];
            callbackFn.call(thisArg, value, index, this);
        }
    }

    filter(callback, thisArg) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        return new ArraySet(this.#values.filter((value, index) => {
            return callback.call(thisArg, value, index, this);
        }));
    }

    at(pos) {
        pos = parseInt(pos);
        if (isNaN(pos)) {
            throw new TypeError("pos must be a number");
        }
        return this.#values.at(pos);
    }

    first() {
        return this.#values.at(0);
    }

    last() {
        return this.#values.at(-1);
    }

    push(...values) {
        this.add(...values);
        return this.size;
    }

    pop() {
        return this.#values.pop();
    }

    unshift(...values) {
        this.insertAt(0, ...values);
        return this.size;
    }

    shift() {
        return this.#values.shift();
    }

    reverse() {
        this.#values.reverse();
        return this;
    }

    slice(start, end) {
        return new ArraySet(this.#values.slice(start, end));
    }

    indexOf(value) {
        return this.#values.indexOf(value);
    }

    [Symbol.iterator]() {
        return new ArraySetIterator(this.#values);
    }

}
