class CustomActionRegistry {

    actions = new Map();

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

}

export default new CustomActionRegistry();
