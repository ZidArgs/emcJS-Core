// TODO sync data to other page instances

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
            return keys.filter((key) => key.startsWith(filter));
        }
        return keys;
    }

    setAll(values) {
        for (const key in values) {
            const value = values[key];
            this.set(key, value);
        }
    }

    getAll(filter) {
        const res = {};
        const keys = this.keys(filter);
        for (const key of keys) {
            res[key] = this.get(key);
        }
        return res;
    }

}

export default new MemoryStorage;
