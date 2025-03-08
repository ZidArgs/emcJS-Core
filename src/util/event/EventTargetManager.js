export default class EventTargetManager {

    #subs = new Map();

    #captures = new Map();

    #target;

    #active;

    constructor(target = null, active = true) {
        if (target != null && !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget or null");
        }
        this.#target = target;
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
            if (this.#target != null) {
                this.#active = value;
                if (value) {
                    for (const [name, handler] of this.#subs) {
                        this.#target.addEventListener(name, handler, {capture: false});
                    }
                    for (const [name, handler] of this.#captures) {
                        this.#target.addEventListener(name, handler, {capture: true});
                    }
                } else {
                    for (const [name, handler] of this.#subs) {
                        this.#target.removeEventListener(name, handler, {capture: false});
                    }
                    for (const [name, handler] of this.#captures) {
                        this.#target.removeEventListener(name, handler, {capture: true});
                    }
                }
            }
        }
    }

    get active() {
        return this.#active;
    }

    switchTarget(target) {
        if (target != null && !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget or null");
        }
        if (this.#target != null) {
            for (const [name, handler] of this.#subs) {
                this.#target.removeEventListener(name, handler, {capture: false});
            }
            for (const [name, handler] of this.#captures) {
                this.#target.removeEventListener(name, handler, {capture: true});
            }
        }
        this.#target = target;
        if (this.#active && target != null) {
            for (const [name, handler] of this.#subs) {
                target.addEventListener(name, handler, {capture: false});
            }
            for (const [name, handler] of this.#captures) {
                target.addEventListener(name, handler, {capture: true});
            }
        }
    }

    get target() {
        return this.#target;
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
            if (this.#active && this.#target != null) {
                if (this.#subs.has(name)) {
                    const oldhandler = this.#subs.get(name);
                    this.#target.removeEventListener(name, oldhandler, {capture: false});
                }
                this.#target.addEventListener(name, handler, {capture: false});
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
            if (this.#active && this.#target != null) {
                if (this.#subs.has(name)) {
                    const oldhandler = this.#subs.get(name);
                    this.#target.removeEventListener(name, oldhandler, {capture: true});
                }
                this.#target.addEventListener(name, handler, {capture: true});
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
            if (this.#target != null) {
                if (this.#subs.has(name)) {
                    const oldhandler = this.#subs.get(name);
                    this.#target.removeEventListener(name, oldhandler, {capture: false});
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
            if (this.#target != null) {
                if (this.#captures.has(name)) {
                    const oldhandler = this.#captures.get(name);
                    this.#target.removeEventListener(name, oldhandler, {capture: true});
                }
            }
            this.#captures.delete(name);
        }
    }

    clear() {
        if (this.#target != null) {
            for (const [name, handler] of this.#subs) {
                this.#target.removeEventListener(name, handler, {capture: false});
            }
            for (const [name, handler] of this.#captures) {
                this.#target.removeEventListener(name, handler, {capture: true});
            }
        }
        this.#subs.clear();
        this.#captures.clear();
    }

}
