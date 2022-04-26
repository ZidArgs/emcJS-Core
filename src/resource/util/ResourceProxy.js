const PROXY_HANDLER = {
    get(target, key) {
        if (typeof key == "symbol") {
            return target[key];
        }
        const path = key.split("/");
        let ref;
        while (!ref && path.length) {
            ref = path.shift();
        }
        if (!ref) {
            return;
        }
        const res = target[ref];
        if (res == null) {
            return;
        }
        if (path.length) {
            if (typeof res == "object") {
                return res[path.join("/")];
            } else {
                return;
            }
        } else {
            return res;
        }
    },
    set() {},
    deleteProperty() {},
    defineProperty() {}
};

export function buildResourceProxy(data) {
    if (typeof data == "object") {
        if (Array.isArray(data)) {
            const res = data.map(buildResourceProxy);
            return new Proxy(res, PROXY_HANDLER);
        } else {
            const res = {};
            for (const key in data) {
                const value = data[key];
                res[key] = buildResourceProxy(value);
            }
            return new Proxy(res, PROXY_HANDLER);
        }
    }
    return data;
}
