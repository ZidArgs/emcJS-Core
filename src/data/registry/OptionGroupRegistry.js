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

    set(value, label) {
        this.#options.set(value, label);
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    get(value) {
        return this.#options.get(value);
    }

    has(value) {
        return this.#options.has(value);
    }

    setAll(options) {
        for (const value in options) {
            const label = options[value];
            this.#options.set(value, label);
        }
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    getAll() {
        const res = {};
        for (const [value, label] of this.#options) {
            res[value] = label;
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
