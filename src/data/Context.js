const DATA = new WeakMap();

export default class Context {

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

    has(key) {
        const data = DATA.get(this);
        return data.has(key);
    }

    delete(key) {
        const data = DATA.get(this);
        data.delete(key);
    }

}
