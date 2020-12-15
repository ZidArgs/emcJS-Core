import FileLoader from "../util/FileLoader.js";

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

const STORAGE = {};

function buildRecursiveProxy(data) {
    if (typeof data == "object") {
        if (Array.isArray(data)) {
            const res = data.map(buildRecursiveProxy);
            return new Proxy(res, PROXY_HANDLER);
        } else {
            const res = {};
            for (const key in data) {
                const value = data[key];
                res[key] = buildRecursiveProxy(value);
            }
            return new Proxy(res, PROXY_HANDLER);
        }
    }
    return data;
}

class FileData {

    async load(files) {
        const loading = [];
        for (const name in files) {
            let path = files[name];
            let type = "text";
            if (typeof path == "object") {
                type = path.type;
                path = path.path;
            }
            if (typeof FileLoader[type] != "function") {
                throw new TypeError(`Unknown file type "${type}" for entry "${name}"`);
            }
            if (typeof path != "string" || path == "") {
                throw new Error(`no path specified for entry "${name}"`);
            }
            loading.push(FileLoader[type](path).then(function(data) {
                STORAGE[name] = buildRecursiveProxy(data);
            }).catch(function(err) {
                throw new Error(`error getting contents of file - ${path}:\n${err.message}`);
            }));
        }
        await Promise.all(loading);
    }

    get(key, value = null) {
        return PROXY_HANDLER.get(STORAGE, key) ?? value;
    }

}

export default new FileData;
