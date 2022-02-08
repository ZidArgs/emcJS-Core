export default class Path {

    #base;

    constructor(base = window.location.origin) {
        this.#base = new URL(base);
    }

    getAbsolute(path) {
        return new URL(path, this.#base);
    }

    traverse(path) {
        return new Path(new URL(path, this.#base));
    }

    static getAbsolute(base, path) {
        return new URL(path, base);
    }

}
