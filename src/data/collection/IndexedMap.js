class IndexedMapIterator {

    #values;

    constructor(values) {
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "Indexed Map Iterator",
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

export default class IndexedMap {

    #entries = [];

    constructor(iterable) {
        if (iterable != null) {
            if (!Array.isArray(iterable) && typeof iterable[Symbol.iterator] !== "function") {
                throw new TypeError("parameter must be array, iterable or undefined");
            }
            let index = 0;
            for (const value of iterable) {
                if (!Array.isArray(value) && value.length < 2) {
                    throw new TypeError(`Iterator value ${index} is not an entry object`);
                }
                this.#entries.push([value[0], value[1]]);
                index++;
            }
        }
    }

    get size() {
        return this.#entries.length;
    }

    add(key, value) {
        const index = this.#entries.findIndex((entry) => entry[0] === key);
        if (index >= 0) {
            this.#entries[index][1] = value;
        } else {
            this.#entries.push([key, value]);
        }
        return this;
    }

    insertAt(pos = 0, key = undefined, value = undefined) {
        const index = this.#entries.findIndex((entry) => entry[0] === key);
        if (index >= 0) {
            this.#entries.splice(index, 1);
        }
        this.#entries.splice(pos, 0, [key, value]);
        return this;
    }

    delete(key) {
        const index = this.#entries.findIndex((entry) => entry[0] === key);
        if (index >= 0) {
            this.#entries.splice(index, 1);
        }
        return this;
    }

    clear() {
        this.#entries = [];
        return this;
    }

    has(key) {
        const index = this.#entries.findIndex((entry) => entry[0] === key);
        if (index >= 0) {
            return true;
        }
        return false;
    }

    keys() {
        return new IndexedMapIterator(this.#entries.map((entry) => entry[0]));
    }

    values() {
        return new IndexedMapIterator(this.#entries.map((entry) => entry[1]));
    }

    entries() {
        return new IndexedMapIterator([...this.#entries]);
    }

    forEach(callback, thisArg) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (const entry of this.#entries) {
            const [key, value] = entry;
            callback.call(thisArg, value, key, this);
        }
    }

    filter(callback, thisArg) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        return new IndexedMap(this.#entries.filter((entry) => {
            const [key, value] = entry;
            return callback.call(thisArg, value, key, this);
        }));
    }

    at(index) {
        return this.#entries.at(index);
    }

    first() {
        return this.#entries.at(0);
    }

    last() {
        return this.#entries.at(-1);
    }

    pop() {
        return this.#entries.pop();
    }

    shift() {
        return this.#entries.shift();
    }

    reverse() {
        this.#entries.reverse();
        return this;
    }

    slice(start, end) {
        return new IndexedMap(this.#entries.slice(start, end));
    }

    indexOf(key) {
        return this.#entries.findIndex((entry) => entry[0] === key);
    }

    [Symbol.iterator]() {
        return new IndexedMapIterator(this.#entries);
    }

}
