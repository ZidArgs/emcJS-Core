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

    add(key) {
        this.#options.set(key, key);
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    get(key) {
        return this.#options.get(key);
    }

    has(key) {
        return this.#options.has(key);
    }

    clear() {
        if (this.#options.size > 0) {
            this.#options.clear();
            const event = new Event("change");
            this.dispatchEvent(event);
        }
    }

    setAll(options) {
        if (options == null || typeof options !== "object") {
            throw new TypeError("options has to be a dict or an array");
        }
        if (Array.isArray(options)) {
            for (const value of options) {
                this.#options.set(value, value);
            }
        } else {
            for (const key in options) {
                const value = options[key];
                this.#options.set(key, value);
            }
        }
        const event = new Event("change");
        this.dispatchEvent(event);
    }

    entries() {
        return this.#options.entries();
    }

    values() {
        return this.#options.values();
    }

    keys() {
        return this.#options.keys();
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

    static reset() {
        for (const [, storage] in REGISTRY_STORAGE) {
            storage.clear();
        }
    }

}
