
const TARGET = new WeakMap();
const ELEMENTS = new WeakMap();
const COMPOSER = new WeakMap();
const MUTATOR = new WeakMap();

export default class ElementManager {

    constructor(target, composer, mutator) {
        if (!(target instanceof HTMLElement)) {
            throw new TypeError("target must be of type HTMLElement");
        }
        TARGET.set(this, target);
        if (typeof composer != "function") {
            throw new TypeError("composer must be a function");
        }
        COMPOSER.set(this, composer);
        if (mutator) {
            if (typeof mutator != "function") {
                throw new TypeError("if mutator is set, mutator must be a function");
            }
            MUTATOR.set(this, mutator);
        }
        ELEMENTS.set(this, new Map());
    }

    manage(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("data must be an object");
        }
        const target = TARGET.get(this);
        const composer = COMPOSER.get(this);
        const mutator = MUTATOR.get(this);
        const elements = ELEMENTS.get(this);
        const unused = new Set(elements.keys());
        for (const index in data) {
            const params = data[index];
            const key = params.key || index;
            if (elements.has(key)) {
                const el = elements.get(key);
                if (mutator) {
                    mutator(el, key, params);
                }
                unused.delete(key);
                target.append(el);
            } else {
                const el = composer(key, params);
                if (mutator) {
                    mutator(el, key, params);
                }
                elements.set(key, el);
                target.append(el);
            }
        }
        unused.forEach(key => {
            elements.get(key).remove();
            elements.delete(key);
        });
    }

}
