/**
 * A Map wrapper only implementing access methods.
 * Can be used to prevent overriding of Map contents.
 */
export default class MapLocker {

    #inst;

    /**
     * Create a new wrapper to prevent altering of the content
     * @param {Map} inst a Map that should be prevented from being altered
     */
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
