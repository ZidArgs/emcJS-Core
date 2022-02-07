import Helper from "../util/helper/Helper.js";

export default class Observable extends EventTarget {

    #buffer = new Map();

    constructor(values) {
        super();
        // ---
        for (const key in values) {
            const value = values[key];
            this.#buffer.set(key, value);
        }
    }

    set(key, value) {
        const old = this.#buffer.get(key);
        if (!Helper.isEqual(old, value)) {
            this.#buffer.set(key, value);
            const ev = new Event(key);
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get(key, value) {
        return this.#buffer.get(key) ?? value;
    }

    delete(key) {
        this.#buffer.delete(key);
        const ev = new Event(key);
        ev.value = undefined;
        this.dispatchEvent(ev);
    }

    has(key) {
        return this.#buffer.has(key);
    }

}
