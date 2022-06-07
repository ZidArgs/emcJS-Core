function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = function(e) {
            resolve(e.target.result);
        };
        request.onerror = function(e) {
            reject(e);
        }
    });
}

function cursorToPromise(cursor, fn) {
    return new Promise((resolve, reject) => {
        const res = {};
        cursor.onsuccess = function(e) {
            const el = e.target.result;
            if (el) {
                if (fn(el.key, el.value)) {
                    res[el.key] = el.value;
                }
                el.continue();
            } else {
                resolve(res);
            }
        };
        cursor.onerror = function(e) {
            reject(e);
        }
    });
}

export default class IDBStorage {

    #iDBInstance;

    #name;

    constructor(name) {
        this.#name = name;
    }

    static #openDB(name) {
        return new Promise(function(resolve, reject) {
            const request = indexedDB.open(name);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data");
                }
            };
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (error) => {
                reject(error);
            };
        });
    }

    async #getIDBInstance() {
        if (this.#iDBInstance == null) {
            this.#iDBInstance = await IDBStorage.#openDB(this.#name);
        }
        return this.#iDBInstance;
    }

    async #getStoreWritable() {
        const iDBinst = await this.#getIDBInstance();
        return iDBinst.transaction("data", "readwrite").objectStore("data");
    }

    async #getStoreReadonly() {
        const iDBinst = await this.#getIDBInstance();
        return iDBinst.transaction("data", "readonly").objectStore("data");
    }

    async set(key, value) {
        const transaction = await this.#getStoreWritable();
        const request = transaction.put(value, key);
        await requestToPromise(request);
    }

    async get(key, value) {
        const transaction = await this.#getStoreReadonly();
        const request = transaction.get(key);
        const result = await requestToPromise(request);
        return result ?? value;
    }

    async has(key) {
        const transaction = await this.#getStoreReadonly();
        const request = transaction.getKey(key);
        const result = await requestToPromise(request);
        return result === key;
    }

    async delete(key) {
        const transaction = await this.#getStoreWritable();
        const request = transaction.delete(key);
        await requestToPromise(request);
    }

    async clear() {
        const transaction = await this.#getStoreWritable();
        const request = transaction.clear();
        await requestToPromise(request);
    }

    async keys(filter) {
        const transaction = await this.#getStoreReadonly();
        const request = transaction.getAllKeys();
        const result = await requestToPromise(request);
        if (typeof filter == "string") {
            return result.filter((key) => key.startsWith(filter));
        }
        return result;
    }

    async getAll(filter) {
        if (typeof filter != "string") {
            filter = "";
        }
        const transaction = await this.#getStoreReadonly();
        const request = transaction.openCursor();
        const result = await cursorToPromise(request, (key) => key.startsWith(filter));
        return result;
    }

    async setAll(values) {
        const transaction = await this.#getStoreWritable();
        const all = [];
        for (const key in values) {
            const value = values[key];
            const request = value == null ? transaction.delete(key) : transaction.put(value, key);
            all.push(requestToPromise(request));
        }
        await Promise.all(all);
    }

}
