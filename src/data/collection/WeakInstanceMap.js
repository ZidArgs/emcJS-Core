import WeakRefValueMap from "./WeakRefValueMap.js";

export default class WeakInstanceMap {

    #types = new Map();

    set(type, key, value) {
        if (!this.#types.has(type)) {
            this.#types.set(type, new WeakRefValueMap());
        }
        this.#types.get(type).set(key, value);
        return this;
    }

    get(type, key) {
        const typeGroup = this.#types.get(type);
        if (typeGroup == null) {
            return null;
        }
        const value = typeGroup.get(key);
        if (value == null && !typeGroup.size) {
            this.#types.delete(type);
        }
        return value;
    }

    has(type, key) {
        const typeGroup = this.#types.get(type);
        if (typeGroup == null) {
            return false;
        }
        const value = typeGroup.get(key);
        if (value == null && !typeGroup.size) {
            this.#types.delete(type);
            return false;
        }
        return true;
    }

}
