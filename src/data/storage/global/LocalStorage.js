class LocalStorage {

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    get(key, value) {
        const res = localStorage.getItem(key);
        if (res != null) {
            return JSON.parse(res);
        }
        return value;
    }

    has(key) {
        return localStorage.getItem(key) != null;
    }

    delete(key) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }

    keys(filter) {
        const keys = Object.keys(localStorage);
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

export default new LocalStorage;
