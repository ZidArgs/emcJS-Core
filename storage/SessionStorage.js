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
            return keys.filter(key => key.startsWith(filter));
        }
        return keys;
    }

    getAll(filter) {
        const res = {};
        const k = this.keys(filter);
        for (const i of k) {
            res[i] = JSON.parse(sessionStorage.getItem(i));
        }
        return res;
    }

}

export default new SessionStorage;
