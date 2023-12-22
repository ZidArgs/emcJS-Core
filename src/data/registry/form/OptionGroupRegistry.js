const REGISTRY_STORAGE = new Map();

export default class OptionGroupRegistry extends EventTarget {

    #options = new Map();

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

    set(key, value) {
        this.#options.set(key, value);
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    get(key) {
        return this.#options.get(key);
    }

    has(key) {
        return this.#options.has(key);
    }

    setAll(options) {
        for (const key in options) {
            const value = options[key];
            this.#options.set(key, value);
        }
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#options) {
            res[key] = value;
        }
        return res;
    }

    [Symbol.iterator]() {
        return this.#options[Symbol.iterator]()
    }

    static load(config) {
        for (const name in config) {
            const options = config[name];
            const registry = new OptionGroupRegistry(name);
            registry.setAll(options);
        }
    }

}
