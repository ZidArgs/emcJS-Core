import DataStorageObserver from "./DataStorageObserver.js";

export default class DataStorageValueObserver extends DataStorageObserver {

    static #instances = new Map();

    static #setInstance(storage, key, inst) {
        if (this.#instances.has(storage)) {
            const insts = this.#instances.get(storage);
            insts.set(key, inst);
        } else {
            const insts = new Map();
            insts.set(key, inst);
            this.#instances.set(storage, insts);
        }
    }

    static getInstance(storage, key) {
        const insts = this.#instances.get(storage);
        return insts?.get(key);
    }

    constructor(storage, key, def) {
        const inst = DataStorageValueObserver.getInstance(storage, key);
        if (inst != null) {
            return inst;
        }
        super(storage, key, def);
        /* --- */
        DataStorageValueObserver.#setInstance(storage, key, this);
    }

    get key() {
        return super.key;
    }

}
