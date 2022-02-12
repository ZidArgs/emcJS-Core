export default class CollectionLocker {

    #inst;

    constructor(inst) {
        if (!(inst instanceof Set)) {
            throw new TypeError("Set expected");
        }
        this.#inst = inst;
    }

    get size() {
        return this.#inst.size;
    }

    has(key) {
        return this.#inst.has(key);
    }

    values() {
        return this.#inst.values();
    }

    entries() {
        return this.#inst.entries();
    }

    [Symbol.iterator]() {
        return this.#inst[Symbol.iterator]();
    }

}
