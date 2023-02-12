const REGISTRY_STORAGE = new Map();
let CURRENT_REGISTRY = null;

export default class CustomActionRegistry {

    actions = new Map();

    constructor(name) {
        if (name != null && typeof name !== "string" || name === "") {
            throw new TypeError("non empty string or null expected");
        }
        name = name ?? "";
        if (REGISTRY_STORAGE.has(name)) {
            return REGISTRY_STORAGE.get(name);
        }
        REGISTRY_STORAGE.set(name, this);
    }

    set(ref, fn) {
        if (typeof fn !== "function") {
            throw new TypeError("only functions can be registered as custom action");
        }
        this.actions.set(ref, fn);
    }

    has(ref) {
        return this.actions.has(ref);
    }

    get(ref) {
        return this.actions.get(ref);
    }

    activate() {
        CURRENT_REGISTRY = this;
    }

    get current() {
        return CURRENT_REGISTRY ?? CustomActionRegistry.getDefaultRegistry();
    }

    getDefaultRegistry() {
        return new CustomActionRegistry();
    }

    getRegistry(name) {
        return new CustomActionRegistry(name);
    }

    removeRegistry(name) {
        if (typeof name !== "string" || name === "") {
            throw new TypeError("non empty string expected");
        }
        const registry = REGISTRY_STORAGE.get(name);
        if (registry != null) {
            REGISTRY_STORAGE.delete(name);
            if (registry === CURRENT_REGISTRY) {
                CURRENT_REGISTRY = new CustomActionRegistry();
            }
        }
    }

}
