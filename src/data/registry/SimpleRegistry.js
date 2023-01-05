export default class SimpleRegistry {

    #data = new Map();

    set(key, value) {
        this.#data.set(key, value);
    }

    get(key) {
        return this.#data.get(key);
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#data) {
            res[key] = value;
        }
        return res;
    }

    [Symbol.iterator]() {
        return this.#data[Symbol.iterator]()
    }

}
