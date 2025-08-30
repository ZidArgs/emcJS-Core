import IDBStorage from "../IDBStorage.js";
import ObservableStorage from "./ObservableStorage.js";

// TODO sync data to other page instances

const INSTANCES = new Map();

export default class ObservableIDBProxyStorage extends ObservableStorage {

    #storage;

    static async create(name) {
        const inst = new ObservableIDBProxyStorage(name);
        return await inst.awaitLoaded();
    }

    constructor(name) {
        if (INSTANCES.has(name)) {
            return INSTANCES.get(name);
        }
        super();
        this.#createStorage(name);
        INSTANCES.set(name, this);
    }

    clone() {
        return this;
    }

    async #createStorage(name) {
        const storage = new IDBStorage(name);
        try {
            const data = await storage.getAll();
            this.deserialize(data);
            const ev = new Event("init");
            this.dispatchEvent(ev);
        } catch (err) {
            console.error(err);
            const ev = new Event("error");
            ev.data = err;
            this.dispatchEvent(ev);
        }
        this.addEventListener("change", async (event) => {
            await storage.setAll(event.data);
        });
        this.addEventListener("load", async (event) => {
            await storage.clear();
            await storage.setAll(event.data);
        });
        this.addEventListener("clear", async (event) => {
            await storage.clear();
            await storage.setAll(event.data);
        });
        this.#storage = storage;
    }

    awaitLoaded() {
        return new Promise((resolve, reject) => {
            if (this.#storage != null) {
                resolve(this);
            } else {
                const successHandler = () => {
                    resolve(this);
                    this.removeEventListener("init", successHandler);
                    this.removeEventListener("error", errorHandler);
                };
                const errorHandler = (event) => {
                    reject(event.data);
                    this.removeEventListener("init", successHandler);
                    this.removeEventListener("error", errorHandler);
                };
                this.addEventListener("init", successHandler);
                this.addEventListener("error", errorHandler);
            }
        });
    }

}
