/**
 * A Set wrapper only implementing access methods.
 * Can be used to prevent overriding of Set contents.
 */
export default class SetLocker {

    #inst;

    /**
     * Create a new wrapper to prevent altering of the content
     * @param {Set} inst a Set that should be prevented from being altered
     */
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
