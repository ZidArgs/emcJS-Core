const DATA = new WeakMap();

export default class Registry {

    constructor() {
        DATA.set(this, new Map());
    }

    set(key, value) {
        const data = DATA.get(this);
        data.set(key, value);
    }

    get(key) {
        const data = DATA.get(this);
        return data.get(key);
    }

    getAll() {
        const data = DATA.get(this);
        const res = {};
        for (const [key, value] of data) {
            res[key] = value;
        }
        return res;
    }

    [Symbol.iterator]() {
        const data = DATA.get(this);
        return data[Symbol.iterator]()
    }

}
