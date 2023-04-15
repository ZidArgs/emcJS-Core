import {
    isEqual
} from "../helper/Comparator.js";
import {
    deepClone
} from "../helper/DeepClone.js";

export default class ElementManager {

    #target;

    #elements = new Map();

    #cache = new Map();

    #args;

    constructor(target, ...args) {
        if (!(target instanceof HTMLElement)) {
            throw new TypeError("target must be of type HTMLElement");
        }
        this.#target = target;
        this.#args = args;
    }

    #checkChange(data) {
        if (typeof data?.key !== "string") {
            return true;
        }
        const cachedData = this.#cache.get(data.key);
        if (cachedData == null || !isEqual(cachedData, data)) {
            this.#cache.set(data.key, deepClone(data));
            return true;
        }
        return false;
    }

    manage(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("data must be an object");
        }
        const unused = new Set(this.#elements.keys());
        for (const index in data) {
            const params = data[index];
            const key = params.key || index;
            if (this.#elements.has(key)) {
                const el = this.#elements.get(key);
                if (this.#checkChange(params)) {
                    this.mutator(el, key, params, ...this.#args);
                }
                unused.delete(key);
                this.#target.append(el);
            } else {
                const el = this.composer(key, params, ...this.#args);
                if (el != null) {
                    this.mutator(el, key, params, ...this.#args);
                    this.#elements.set(key, el);
                    this.#target.append(el);
                }
            }
        }
        for (const key of unused) {
            const el = this.#elements.get(key);
            el.remove();
            this.#elements.delete(key);
            this.#cache.delete(key);
            this.cleanup(el, key, ...this.#args);
        }
    }

    // eslint-disable-next-line no-unused-vars
    composer(key, params, ...args) {
        // ignore
    }

    // eslint-disable-next-line no-unused-vars
    mutator(el, key, params, ...args) {
        // ignore
    }

    // eslint-disable-next-line no-unused-vars
    cleanup(el, key, ...args) {
        // ignore
    }

}
