import {
    debounce
} from "../Debouncer.js";
import {
    isEqual
} from "../helper/Comparator.js";
import {
    deepClone
} from "../helper/DeepClone.js";

export default class ElementManager {

    #target;

    #elements = new Map();

    #data = new Map();

    #cache = new Map();

    #definedOrder = [];

    #order = [];

    #sorter = null;

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
        this.#definedOrder = [];

        for (const index in data) {
            const params = data[index];
            if (typeof params !== "object" || Array.isArray(params)) {
                throw new TypeError("data entries must be objects");
            }

            const {key = index, ...options} = params;
            this.#definedOrder.push(key);

            if (!this.#elements.has(key)) {
                this.#data.set(key, params);
                this.#cache.set(key, deepClone(params));
                const el = this.composer(key, options, ...this.#args);
                if (el != null) {
                    el.setAttribute("em-key", key);
                    this.mutator(el, key, options, ...this.#args);
                    this.#elements.set(key, el);
                    changes.added.push(key);
                }
            } else {
                const el = this.#elements.get(key);
                if (this.#checkChange(params)) {
                    this.#data.set(key, params);
                    this.mutator(el, key, options, ...this.#args);
                    changes.updated.push(key);
                }
                unused.delete(key);
            }
        }

        for (const key of unused) {
            const el = this.#elements.get(key);
            el.remove();
            this.#elements.delete(key);
            this.#cache.delete(key);
            changes.deleted.push(key);
            this.cleanup(el, key, ...this.#args);
        }

        this.#sortEntries(changes);

        return changes;
    }

    registerSortFunction(sorter) {
        if (typeof sorter === "function") {
            if (this.#sorter !== sorter) {
                this.#sorter = sorter;
                const changes = {added: [], updated: [], deleted: [], moved: []};
                this.#sortEntries(changes);
                return changes;
            }
        } else {
            this.#sorter = null;
            const changes = {added: [], updated: [], deleted: [], moved: []};
            this.#sortEntries(changes);
            return changes;
        }
    }

    sort() {
        if (this.#sorter != null) {
            const changes = {added: [], updated: [], deleted: [], moved: []};
            this.#sortEntries(changes);
            return changes;
        }
    }

    #sortEntries(changes) {
        if (this.#sorter != null && this.#cache.size > 0) {
            const newOrder = this.#definedOrder.toSorted((key0, key1) => {
                const data0 = this.#data.get(key0);
                const data1 = this.#data.get(key1);
                if (data0 == null || data1 == null) {
                    return 0;
                }
                return this.#sorter(data0, data1);
            });
            if (!isEqual(this.#order, newOrder)) {
                for (const oldIndex in this.#order) {
                    const key = this.#order[oldIndex];
                    const newIndex = newOrder.indexOf(key);
                    if (oldIndex !== newIndex) {
                        changes.moved.push(key);
                    }
                }
                this.#order = newOrder;
                this.#render();
            }
        } else if (!isEqual(this.#order, this.#definedOrder)) {
            this.#order = this.#definedOrder;
            this.#render();
        }
    }

    #render = debounce(() => {
        for (const key of this.#order) {
            const el = this.#elements.get(key);
            if (el != null) {
                this.#target.append(el);
            }
        }
    });

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
