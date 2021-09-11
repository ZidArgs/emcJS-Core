import DataStorageObserver from "./DataStorageObserver.js";

const INSTANCES = new WeakMap();

function getInstance(storage, key) {
    const insts = INSTANCES.get(storage);
    if (insts != null) {
        return insts.get(key);
    }
}

function setInstance(storage, key, inst) {
    if (INSTANCES.has(storage)) {
        const insts = INSTANCES.get(storage);
        insts.set(key, inst);
    } else {
        const insts = new Map();
        insts.set(key, inst);
        INSTANCES.set(storage, insts);
    }
}

export default class DataStorageValueObserver extends DataStorageObserver {

    constructor(storage, key, def) {
        const inst = getInstance(storage, key);
        if (inst != null) {
            return inst;
        }
        super(storage, key, def);
        /* --- */
        setInstance(storage, key, this);
    }

    get key() {
        return super.key;
    }

}
