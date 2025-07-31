const HANDLER = {
    set() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    defineProperty() {
        return false;
    },
    isExtensible() {
        return false;
    },
    preventExtensions() {
        return false;
    },
    setPrototypeOf() {
        return false;
    }
};

const TYPE_TAG = Symbol("Immutable");

/**
 * Create an immutable Object utilizing Proxy
 * @param {Object} target an object to immute, primitives can not be immuted
 * @returns {Proxy} the Proxy immuting the data
 */
export function immute(target) {
    if (target != null && typeof target == "object" && !target[TYPE_TAG]) {
        if (Array.isArray(target)) {
            const res = target.map(immute);
            const proxy = new Proxy(res, HANDLER);
            Object.defineProperty(res, TYPE_TAG, {value: true});
            return proxy;
        }
        if (target.constructor == Object) {
            const res = {};
            for (const key in target) {
                const value = target[key];
                res[key] = immute(value);
            }
            const proxy = new Proxy(res, HANDLER);
            Object.defineProperty(res, TYPE_TAG, {value: true});
            return proxy;
        }
    }
    return target;
}
