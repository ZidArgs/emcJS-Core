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

    #composer;

    #mutator;

    #cleanup;

    #args;

    constructor(target, options, ...args) {
        if (!(target instanceof HTMLElement)) {
            throw new TypeError("target must be of type HTMLElement");
        }
        this.#target = target;
        if (typeof options === "function") {
            this.#composer = options;
        } else if (typeof options === "object" && !Array.isArray(options)) {
            const {composer, mutator, cleanup} = options;
            if (typeof composer != "function") {
                throw new TypeError("composer must be a function");
            }
            this.#composer = composer;
            if (mutator) {
                if (typeof mutator != "function") {
                    throw new TypeError("mutator must be a function or undefined");
                }
                this.#mutator = mutator;
            }
            if (cleanup) {
                if (typeof cleanup != "function") {
                    throw new TypeError("cleanup must be a function or undefined");
                }
                this.#cleanup = cleanup;
            }
        } else {
            throw new TypeError("second argument must be a composer function or an options object containing at least a composer function");
        }
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
                if (this.#mutator && this.#checkChange(params)) {
                    this.#mutator(el, key, params, ...this.#args);
                }
                unused.delete(key);
                this.#target.append(el);
            } else {
                const el = this.#composer(key, params, ...this.#args);
                if (el != null) {
                    if (this.#mutator) {
                        this.#mutator(el, key, params, ...this.#args);
                    }
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
            if (this.#cleanup) {
                this.#cleanup(el, key, ...this.#args);
            }
        }
    }

}
