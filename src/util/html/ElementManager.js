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

    #order = [];

    #args;

    constructor(target, ...args) {
        if (!(target instanceof HTMLElement)) {
            throw new TypeError("target must be of type HTMLElement");
        }
        this.#target = target;
        this.#args = args;
    }

    manage(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("data must be an array");
        }

        const unused = new Set(this.#elements.keys());
        const changes = {added: [], updated: [], deleted: [], moved: []};
        const newOrder = [];

        for (const index in data) {
            const params = data[index];
            if (typeof params !== "object" || Array.isArray(params)) {
                throw new TypeError("data entries must be objects");
            }

            const {key = index, ...options} = params;
            const oldIndex = this.#order.indexOf(key);
            if (oldIndex > 0 && oldIndex !== index) {
                changes.moved.push(key);
            }
            newOrder.push(key);

            if (!this.#elements.has(key)) {
                const el = this.composer(key, options, ...this.#args);
                if (el != null) {
                    el.setAttribute("em-key", key);
                    this.mutator(el, key, options, ...this.#args);
                    this.#elements.set(key, el);
                    changes.added.push(key);
                    this.#target.append(el);
                }
            } else {
                const el = this.#elements.get(key);
                if (this.#checkChange(params)) {
                    this.mutator(el, key, options, ...this.#args);
                    changes.updated.push(key);
                }
                unused.delete(key);
                this.#target.append(el);
            }
        }
        this.#order = newOrder;

        for (const key of unused) {
            const el = this.#elements.get(key);
            el.remove();
            this.#elements.delete(key);
            this.#cache.delete(key);
            changes.deleted.push(key);
            this.cleanup(el, key, ...this.#args);
        }

        return changes;
    }

    #checkChange(data) {
        if (typeof data?.key !== "string") {
            return true;
        }
        const cachedData = this.#cache.get(data.key);
        if (!isEqual(cachedData, data)) {
            this.#cache.set(data.key, deepClone(data));
            return true;
        }
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    composer(key, options, ...args) {
        // ignore
    }

    // eslint-disable-next-line no-unused-vars
    mutator(el, key, options, ...args) {
        // ignore
    }

    // eslint-disable-next-line no-unused-vars
    cleanup(el, key, ...args) {
        // ignore
    }

}
