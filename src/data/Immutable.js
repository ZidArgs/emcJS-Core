const HANDLER = {
    get(target, key) {
        return target[key];
    },
    set() {},
    deleteProperty() {},
    defineProperty() {}
};

export function immuteRecursive(data) {
    if (typeof data == "object") {
        if (Array.isArray(data)) {
            const res = data.map(immuteRecursive);
            return new Proxy(res, HANDLER);
        } else {
            const res = {};
            for (const key in data) {
                const value = data[key];
                res[key] = immuteRecursive(value);
            }
            return new Proxy(res, HANDLER);
        }
    }
    return data;
}
