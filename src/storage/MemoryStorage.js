const STORAGE = new Map();

class MemoryStorage {

    set(key, value) {
        STORAGE.set(key, JSON.stringify(value));
    }

    get(key, value) {
        const res = STORAGE.get(key);
        if (res != null) {
            return JSON.parse(res);
        }
        return value;
    }

    has(key) {
        return STORAGE.has(key);
    }

    delete(key) {
        STORAGE.delete(key);
    }

    clear() {
        STORAGE.clear();
    }

    keys(filter) {
        const keys = STORAGE.keys();
        if (typeof filter == "string") {
            return keys.filter(key => key.startsWith(filter));
        }
        return keys;
    }

    getAll(filter) {
        const res = {};
        const k = this.keys(filter);
        for (const i of k) {
            res[i] = JSON.parse(STORAGE.get(i));
        }
        return res;
    }

}

export default new MemoryStorage;
