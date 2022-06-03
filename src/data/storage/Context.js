export default class Context {

    #data = new Map();

    set(key, value) {
        this.#data.set(key, value);
    }

    get(key) {
        return this.#data.get(key);
    }

    has(key) {
        return this.#data.has(key);
    }

    delete(key) {
        this.#data.delete(key);
    }

}
