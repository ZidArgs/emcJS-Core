const REGISTRY_STORAGE = new Map();

export default class ListGroupRegistry extends EventTarget {

    #options = new Set();

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

    add(value) {
        this.#options.add(value);
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    get(value) {
        return this.#options.get(value);
    }

    has(value) {
        return this.#options.has(value);
    }

    setAll(list) {
        for (const value of list) {
            this.#options.add(value);
        }
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    getAll() {
        const res = [];
        for (const value of this.#options) {
            res.push(value);
        }
        return res;
    }

    [Symbol.iterator]() {
        return this.#options[Symbol.iterator]()
    }

    static load(config) {
        for (const name in config) {
            const options = config[name];
            const registry = new ListGroupRegistry(name);
            registry.setAll(options);
        }
    }

}
