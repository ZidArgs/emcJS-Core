export default class EventMultiTargetManager {

    #subs = new Map();

    #targets = new Set();

    #active;

    constructor(active = true) {
        this.#active = !!active;
    }

    setActive(value) {
        value = !!value;
        if (this.#active != value) {
            this.#active = value;
            for (const target of this.#targets.values()) {
                if (value) {
                    for (const [name, handler] of this.#subs.entries()) {
                        target.addEventListener(name, handler, {capture: true});
                    }
                } else {
                    for (const [name, handler] of this.#subs.entries()) {
                        target.removeEventListener(name, handler, {capture: true});
                    }
                }
            }
        }
    }

    addTarget(target) {
        if (target == null || !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget");
        }
        if (!this.#targets.has(target)) {
            this.#targets.add(target);
            if (this.#active) {
                for (const [name, handler] of this.#subs.entries()) {
                    target.addEventListener(name, handler, {capture: true});
                }
            }
        }
    }

    removeTarget(target) {
        if (target == null || !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget");
        }
        if (this.#targets.has(target)) {
            this.#targets.delete(target);
            for (const [name, handler] of this.#subs.entries()) {
                target.removeEventListener(name, handler, {capture: true});
            }
        }
    }

    clearTargets() {
        for (const target of this.#targets.values()) {
            for (const [name, handler] of this.#subs.entries()) {
                target.removeEventListener(name, handler, {capture: true});
            }
        }
        this.#targets.clear();
    }

    getTargets() {
        return Array.from(this.#targets.values());
    }

    set(name, handler) {
        if (typeof handler != "function") {
            throw new TypeError(`handler parameter must be of type "function" but was "${typeof handler}"`);
        }
        if (Array.isArray(name)) {
            for (const n of name) {
                this.set(n, handler)
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            if (this.#subs.has(name)) {
                for (const target of this.#targets.values()) {
                    const oldhandler = this.#subs.get(name);
                    target.removeEventListener(name, oldhandler, {capture: true});
                }
            }
            if (this.#active) {
                for (const target of this.#targets.values()) {
                    target.addEventListener(name, handler, {capture: true});
                }
            }
            this.#subs.set(name, handler);
        }
    }

    delete(name) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.delete(n)
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            if (this.#subs.has(name)) {
                for (const target of this.#targets.values()) {
                    const oldhandler = this.#subs.get(name);
                    target.removeEventListener(name, oldhandler, {capture: true});
                }
            }
            this.#subs.delete(name);
        }
    }

    clear() {
        for (const target of this.#targets.values()) {
            for (const [name, handler] of this.#subs.entries()) {
                target.removeEventListener(name, handler, {capture: true});
            }
        }
        this.#subs.clear();
    }

}
