export default class IDBStorage {

    #iDBInstance;

    #name;

    constructor(name) {
        this.#name = name;
    }

    static #openDB(name) {
        return new Promise(function(resolve, reject) {
            const request = indexedDB.open(name);
            request.onupgradeneeded = function(event) {
                const db = request.result;
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data");
                }
            };
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function(e) {
                reject(e);
            }
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

    set(key, value) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreWritable();
            const request = transaction.put(value, key);
            request.onsuccess = function(e) {
                resolve();
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    get(key, value) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreReadonly();
            const request = transaction.get(key);
            request.onsuccess = function(e) {
                const res = e.target.result;
                if (res != null) {
                    resolve(res);
                } else {
                    resolve(value);
                }
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    has(key) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreReadonly();
            const request = transaction.getKey(key);
            request.onsuccess = function(e) {
                resolve(e.target.result === key);
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    delete(key) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreWritable();
            const request = transaction.delete(key);
            request.onsuccess = function(e) {
                resolve();
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    clear() {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreWritable();
            const request = transaction.clear();
            request.onsuccess = function(e) {
                resolve();
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    keys(filter) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreReadonly();
            const request = transaction.getAllKeys();
            request.onsuccess = function(e) {
                const res = e.target.result;
                if (typeof filter == "string") {
                    resolve(res.filter(key => key.startsWith(filter)));
                } else {
                    resolve(res);
                }
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    getAll(filter) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreReadonly();
            const request = transaction.openCursor();
            const res = {};
            request.onsuccess = function(e) {
                const el = e.target.result;
                if (el) {
                    res[el.key] = el.value;
                    el.continue();
                } else if (typeof filter == "string") {
                    resolve(res.filter(key => key.startsWith(filter)));
                } else {
                    resolve(res);
                }
            };
            request.onerror = function(e) {
                reject(e);
            }
        }.bind(this));
    }

    setAll(values) {
        return new Promise(async function(resolve, reject) {
            const transaction = await this.#getStoreWritable();
            const all = [];
            for (const key in values) {
                all.push(new Promise(function(res, rej) {
                    const value = values[key];
                    const request = value == null ? transaction.delete(key) : transaction.put(value, key);
                    request.onsuccess = function(e) {
                        res();
                    };
                    request.onerror = function(e) {
                        rej(e);
                    }
                }));
            }
            Promise.all(all).then(resolve, reject);
        }.bind(this));
    }

}
