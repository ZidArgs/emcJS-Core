export default class CloneCache {

    #data = new WeakMap();

    get(key) {
        return this.#data.get(key);
    }

    set(key, value) {
        this.#data.set(key, value);
        return value;
    }

    has(key) {
        return this.#data.has(key);
    }

}
