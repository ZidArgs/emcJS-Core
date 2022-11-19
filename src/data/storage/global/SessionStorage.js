// TODO sync data to other page instances

class SessionStorage {

    set(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    get(key, value) {
        const res = sessionStorage.getItem(key);
        if (res != null) {
            return JSON.parse(res);
        }
        return value;
    }

    has(key) {
        return sessionStorage.getItem(key) != null;
    }

    delete(key) {
        sessionStorage.removeItem(key);
    }

    clear() {
        sessionStorage.clear();
    }

    keys(filter) {
        const keys = Object.keys(sessionStorage);
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

export default new SessionStorage;
