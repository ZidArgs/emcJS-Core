export default class MapLocker {

    #inst;

    constructor(inst) {
        if (!(inst instanceof Map)) {
            throw new TypeError("Map expected");
        }
        this.#inst = inst;
    }

    get size() {
        return this.#inst.size;
    }

    has(key) {
        return this.#inst.has(key);
    }

    get(key) {
        return this.#inst.get(key);
    }

    values() {
        return this.#inst.values();
    }

    keys() {
        return this.#inst.keys();
    }

    entries() {
        return this.#inst.entries();
    }

    [Symbol.iterator]() {
        return this.#inst[Symbol.iterator]();
    }

}
