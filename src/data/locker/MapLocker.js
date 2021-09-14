const INST = new WeakMap();

export default class MapLocker {

    constructor(inst) {
        if (!(inst instanceof Map)) {
            throw new TypeError("Map expected");
        }
        INST.set(this, inst);
    }

    get size() {
        const inst = INST.get(this);
        return inst.size;
    }
    
    has(key) {
        const inst = INST.get(this);
        return inst.has(key);
    }
    
    get(key) {
        const inst = INST.get(this);
        return inst.get(key);
    }

    values() {
        const inst = INST.get(this);
        return inst.values();
    }

    keys() {
        const inst = INST.get(this);
        return inst.keys();
    }

    entries() {
        const inst = INST.get(this);
        return inst.entries();
    }

    [Symbol.iterator]() {
        const inst = INST.get(this);
        return inst[Symbol.iterator]();
    }

}
