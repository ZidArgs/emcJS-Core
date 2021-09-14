const INST = new WeakMap();

export default class CollectionLocker {

    constructor(inst) {
        if (!(inst instanceof Set)) {
            throw new TypeError("Set expected");
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

    values() {
        const inst = INST.get(this);
        return inst.values();
    }

    [Symbol.iterator]() {
        const inst = INST.get(this);
        return inst[Symbol.iterator]();
    }

}
