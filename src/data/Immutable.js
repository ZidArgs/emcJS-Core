const HANDLER = {
    get(target, property) {
        return target[property];
    },
    set() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    defineProperty() {
        return false;
    },
    preventExtensions() {
        return false;
    }
};

/**
 * Create an immutable Object utilizing Proxy
 * @param {Object} data an object to immute, primitives can not be immuted
 * @returns {Proxy} the Proxy immuting the data
 */
export function immute(data) {
    if (typeof data == "object") {
        if (Array.isArray(data)) {
            const res = data.map(immute);
            return new Proxy(res, HANDLER);
        } else {
            const res = {};
            for (const key in data) {
                const value = data[key];
                res[key] = immute(value);
            }
            return new Proxy(res, HANDLER);
        }
    }
    return data;
}
