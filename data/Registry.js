const DATA = new WeakMap();

export default class Registry {

    constructor() {
        DATA.set(this, new Map());
    }

    set(ref, entry) {
        const data = DATA.get(this);
        data.set(ref, entry);
    }

    get(ref) {
        const data = DATA.get(this);
        return data.get(ref);
    }

}
