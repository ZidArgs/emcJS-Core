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

    keys() {
        return this.#inst.keys();
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

    forEach(callbackFn, thisArg) {
        this.#inst.forEach((value, key) => {
            callbackFn.call(thisArg, value, key, this);
        });
    }

    difference(other) {
        return this.#inst.difference(other);
    }

    intersection(other) {
        return this.#inst.intersection(other);
    }

    isDisjointFrom(other) {
        return this.#inst.isDisjointFrom(other);
    }

    isSubsetOf(other) {
        return this.#inst.isSubsetOf(other);
    }

    isSupersetOf(other) {
        return this.#inst.isSupersetOf(other);
    }

    symmetricDifference(other) {
        return this.#inst.symmetricDifference(other);
    }

    union(other) {
        return this.#inst.union(other);
    }

}
