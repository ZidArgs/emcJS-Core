const REGISTRY_STORAGE = new Map();

export default class TokenRegistry extends EventTarget {

    #token = new Set();

    constructor(name) {
        super();
        if (name != null && typeof name !== "string" || name === "") {
            throw new TypeError("non empty string or null expected");
        }
        name = name ?? "";
        if (REGISTRY_STORAGE.has(name)) {
            return REGISTRY_STORAGE.get(name);
        }
        REGISTRY_STORAGE.set(name, this);
    }

    add(token) {
        this.#token.add(token);
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    has(ref) {
        return this.#token.has(ref);
    }

    getAll() {
        const res = [];
        for (const ref of this.#token) {
            res.push(ref);
        }
        return res;
    }

    [Symbol.iterator]() {
        return this.#token[Symbol.iterator]()
    }

}
