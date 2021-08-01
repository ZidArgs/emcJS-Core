const HANDLER = {
    get(target, key) {
        return target[key] || undefined;
    },
    set() {},
    deleteProperty() {},
    defineProperty() {}
};

function buildRecursiveProxy(data) {
    if (typeof data == "object") {
        if (Array.isArray(data)) {
            const res = data.map(buildRecursiveProxy);
            return new Proxy(res, HANDLER);
        } else {
            const res = {};
            for (const key in data) {
                const value = data[key];
                res[key] = buildRecursiveProxy(value);
            }
            return new Proxy(res, HANDLER);
        }
    }
    return data;
}

export default class Immutable {

    constructor(target) {
        return buildRecursiveProxy(target);
    }

}
