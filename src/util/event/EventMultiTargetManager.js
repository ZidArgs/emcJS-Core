export default class EventMultiTargetManager {

    #subs = new Map();

    #captures = new Map();

    #targets = new Set();

    #active;

    constructor(active = true) {
        this.#active = !!active;
    }

    /**
     * @deprecated
     */
    setActive(value) {
        console.warn("Used instance.setActive(value); will not be supported anymore in the future. Use instance.active = value; instead;");
        this.active = value;
    }

    set active(value) {
        value = !!value;
        if (this.#active != value) {
            this.#active = value;
            for (const target of this.#targets) {
                if (value) {
                    for (const [name, handler] of this.#subs) {
                        target.addEventListener(name, handler, {capture: false});
                    }
                    for (const [name, handler] of this.#captures) {
                        target.addEventListener(name, handler, {capture: true});
                    }
                } else {
                    for (const [name, handler] of this.#subs) {
                        target.removeEventListener(name, handler, {capture: false});
                    }
                    for (const [name, handler] of this.#captures) {
                        target.removeEventListener(name, handler, {capture: true});
                    }
                }
            }
        }
    }

    get active() {
        return this.#active;
    }

    addTarget(target) {
        if (target == null || !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget");
        }
        if (!this.#targets.has(target)) {
            this.#targets.add(target);
            if (this.#active) {
                for (const [name, handler] of this.#subs) {
                    target.addEventListener(name, handler, {capture: false});
                }
                for (const [name, handler] of this.#captures) {
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
            for (const [name, handler] of this.#subs) {
                target.removeEventListener(name, handler, {capture: false});
            }
            for (const [name, handler] of this.#captures) {
                target.removeEventListener(name, handler, {capture: true});
            }
        }
    }

    clearTargets() {
        for (const target of this.#targets) {
            for (const [name, handler] of this.#subs) {
                target.removeEventListener(name, handler, {capture: false});
            }
            for (const [name, handler] of this.#captures) {
                target.removeEventListener(name, handler, {capture: true});
            }
        }
        this.#targets.clear();
    }

    getTargets() {
        return Array.from(this.#targets);
    }

    set(name, handler) {
        if (typeof handler != "function") {
            throw new TypeError(`handler parameter must be of type "function" but was "${typeof handler}"`);
        }
        if (Array.isArray(name)) {
            for (const n of name) {
                this.set(n, handler);
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            if (this.#subs.has(name)) {
                for (const target of this.#targets) {
                    const oldhandler = this.#subs.get(name);
                    target.removeEventListener(name, oldhandler, {capture: false});
                }
            }
            if (this.#active) {
                for (const target of this.#targets) {
                    target.addEventListener(name, handler, {capture: false});
                }
            }
            this.#subs.set(name, handler);
        }
    }

    setCapture(name, handler) {
        if (typeof handler != "function") {
            throw new TypeError(`handler parameter must be of type "function" but was "${typeof handler}"`);
        }
        if (Array.isArray(name)) {
            for (const n of name) {
                this.set(n, handler);
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            if (this.#captures.has(name)) {
                for (const target of this.#targets) {
                    const oldhandler = this.#captures.get(name);
                    target.removeEventListener(name, oldhandler, {capture: true});
                }
            }
            if (this.#active) {
                for (const target of this.#targets) {
                    target.addEventListener(name, handler, {capture: true});
                }
            }
            this.#captures.set(name, handler);
        }
    }

    delete(name) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.delete(n);
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            if (this.#subs.has(name)) {
                for (const target of this.#targets) {
                    const oldhandler = this.#subs.get(name);
                    target.removeEventListener(name, oldhandler, {capture: false});
                }
            }
            this.#subs.delete(name);
        }
    }

    deleteCapture(name) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.delete(n);
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            if (this.#captures.has(name)) {
                for (const target of this.#targets) {
                    const oldhandler = this.#captures.get(name);
                    target.removeEventListener(name, oldhandler, {capture: true});
                }
            }
            this.#captures.delete(name);
        }
    }

    clear() {
        for (const target of this.#targets) {
            for (const [name, handler] of this.#subs) {
                target.removeEventListener(name, handler, {capture: false});
            }
            for (const [name, handler] of this.#captures) {
                target.removeEventListener(name, handler, {capture: true});
            }
        }
        this.#subs.clear();
        this.#captures.clear();
    }

}
