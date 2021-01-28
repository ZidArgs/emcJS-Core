const BASE = new WeakMap();

export default class Path {

    constructor(base = window.location.origin) {
        BASE.set(this, new URL(base));
    }

    getAbsolute(path) {
        const base = BASE.get(this);
        return new URL(path, base);
    }

    static getAbsolute(base, path) {
        return new URL(path, base);
    }

}
