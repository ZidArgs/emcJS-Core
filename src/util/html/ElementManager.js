import {
    debounce
} from "../Debouncer.js";
import {
    isEqual
} from "../helper/Comparator.js";
import {
    deepClone
} from "../helper/DeepClone.js";
import {
    getArrayMutations
} from "../helper/collection/ArrayMutations.js";

export default class ElementManager {

    #target;

    #elements = new Map();

    #data = new Map();

    #cache = new Map();

    #definedOrder = [];

    #order = [];

    #sorter = null;

    #args;

    #currentRenderTimeout;

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
                }
            } else {
                const el = this.#elements.get(key);
                if (this.#checkChange(params)) {
                    this.#data.set(key, params);
                    this.mutator(el, key, options, ...this.#args);
                }
                unused.delete(key);
            }
        }

        for (const key of unused) {
            const el = this.#elements.get(key);
            el.remove();
            this.#elements.delete(key);
            this.#cache.delete(key);
            this.cleanup(el, key, ...this.#args);
        }

        this.#sortEntries();
    }

    registerSortFunction(sorter) {
        if (typeof sorter === "function") {
            if (this.#sorter !== sorter) {
                this.#sorter = sorter;
                this.#sortEntries();
            }
        } else {
            this.#sorter = null;
            this.#sortEntries();
        }
    }

    sort() {
        if (this.#sorter != null) {
            this.#sortEntries();
        }
    }

    #sortEntries() {
        if (this.#sorter != null && this.#cache.size > 0) {
            const newOrder = this.#definedOrder.toSorted((key0, key1) => {
                const data0 = this.#data.get(key0);
                const data1 = this.#data.get(key1);
                const el0 = this.#elements.get(key0);
                const el1 = this.#elements.get(key1);
                if (data0 == null || data1 == null) {
                    return 0;
                }
                return this.#sorter({
                    data: data0,
                    element: el0
                }, {
                    data: data1,
                    element: el1
                });
            });
            if (!isEqual(this.#order, newOrder)) {
                this.#order = newOrder;
                this.#render();
            }
        } else if (!isEqual(this.#order, this.#definedOrder)) {
            this.#order = this.#definedOrder;
            this.#render();
        }
    }

    #render = debounce(() => {
        clearTimeout(this.#currentRenderTimeout);
        const children = this.#target.children;
        if (children.length > 0) {
            const currentOrder = [...children].map((el) => el.getAttribute("em-key") ?? "");
            const keys = [...this.#order];
            const {changes} = getArrayMutations(currentOrder, keys);
            for (const {sequence} of changes) {
                for (const key of sequence) {
                    const el = this.#elements.get(key);
                    el.remove();
                }
            }
            for (const {sequence, position} of changes) {
                const els = [];
                for (const key of sequence) {
                    const el = this.#elements.get(key);
                    els.push(el);
                }
                if (position === 0) {
                    this.#target.prepend(...els);
                } else {
                    this.#target.children[position - 1].after(...els);
                }
            }
        } else {
            const els = [];
            for (const key of this.#order) {
                const el = this.#elements.get(key);
                els.push(el);
            }
            this.#target.append(...els);
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
