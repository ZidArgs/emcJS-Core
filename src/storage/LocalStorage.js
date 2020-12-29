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
            return keys.filter(key => key.startsWith(filter));
        }
        return keys;
    }

    getAll(filter) {
        const res = {};
        const k = this.keys(filter);
        for (const i of k) {
            res[i] = JSON.parse(localStorage.getItem(i));
        }
        return res;
    }

}

export default new LocalStorage;
