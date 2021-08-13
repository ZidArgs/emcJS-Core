import IDBStorage from "../storage/IDBStorage.js";
import DataStorage from "./DataStorage.js";

const STORAGE = new WeakMap();

export default class IDBProxyStorage extends DataStorage {

    constructor(name) {
        super();
        const storage = new IDBStorage(name);
        // ---
        storage.getAll().then(data => {
            STORAGE.set(this, storage);
            this.deserialize(data);
        }).catch(err => {
            STORAGE.set(this, storage);
            console.error(err);
            const ev = new Event("error");
            this.dispatchEvent(ev);
        });
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
    }

    awaitLoaded() {
        return new Promise((resolve) => {
            if (STORAGE.has(this)) {
                resolve(this);
            } else {
                const handler = () => {
                    resolve(this);
                    this.removeEventListener("load", handler);
                    this.removeEventListener("error", handler);
                }
                this.addEventListener("load", handler);
                this.addEventListener("error", handler);
            }
        });
    }

}
