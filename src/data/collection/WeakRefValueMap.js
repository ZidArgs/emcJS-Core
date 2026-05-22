export default class WeakRefValueMap {

    #data = new Map();

    get(key) {
        const value = this.#data.get(key)?.deref();
        if (value == null) {
            this.#data.delete(key);
        }
        return value;
    }

    set(key, value) {
        this.#data.set(key, new WeakRef(value));
        return this;
    }

    delete(key) {
        this.#data.delete(key);
        return this;
    }

    has(key) {
        const value = this.#data.get(key)?.deref();
        if (value == null) {
            this.#data.delete(key);
            return false;
        }
        return true;
    }

    get size() {
        return this.#data.size;
    }

}
