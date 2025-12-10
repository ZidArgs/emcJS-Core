export default class EventMultiTargetManager {

    #normalSubscriberList = new Map();

    #captureSubscriberList = new Map();

    #passiveSubscriberList = new Map();

    #capturePassiveSubscriberList = new Map();

    #targets = new Set();

    #active;

    constructor(active = true) {
        this.#active = !!active;
    }

    set active(value) {
        value = !!value;
        if (this.#active != value) {
            this.#active = value;
            for (const target of this.#targets) {
                if (value) {
                    this.#addEventListeners(target);
                } else {
                    this.#removeEventListeners(target);
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
                this.#addEventListeners(target);
            }
        }
    }

    removeTarget(target) {
        if (target == null || !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget");
        }
        if (this.#targets.has(target)) {
            this.#removeEventListeners(target);
            this.#targets.delete(target);
        }
    }

    clearTargets() {
        for (const target of this.#targets) {
            this.#removeEventListeners(target);
        }
        this.#targets.clear();
    }

    getTargets() {
        return Array.from(this.#targets);
    }

    set(name, handler, options) {
        if (typeof handler != "function") {
            throw new TypeError(`handler parameter must be of type "function" but was "${typeof handler}"`);
        }
        if (Array.isArray(name)) {
            for (const n of name) {
                this.set(n, handler, options);
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            const {
                capture = false, passive = false
            } = options ?? {};
            const subscriberList = this.#getSubscriberList(capture, passive);
            if (subscriberList.has(name)) {
                for (const target of this.#targets) {
                    const oldhandler = subscriberList.get(name);
                    target.removeEventListener(name, oldhandler, {
                        capture,
                        passive
                    });
                }
            }
            if (this.#active) {
                for (const target of this.#targets) {
                    target.addEventListener(name, handler, {
                        capture,
                        passive
                    });
                }
            }
            subscriberList.set(name, handler);
        }
    }

    delete(name, options) {
        if (Array.isArray(name)) {
            for (const n of name) {
                this.delete(n, options);
            }
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            const {
                capture = false, passive = false
            } = options ?? {};
            const subscriberList = this.#getSubscriberList(capture, passive);
            if (subscriberList.has(name)) {
                for (const target of this.#targets) {
                    const oldhandler = subscriberList.get(name);
                    target.removeEventListener(name, oldhandler, {
                        capture,
                        passive
                    });
                }
            }
            subscriberList.delete(name);
        }
    }

    clear() {
        for (const target of this.#targets) {
            this.#removeEventListeners(target);
        }
        this.#normalSubscriberList.clear();
        this.#captureSubscriberList.clear();
        this.#passiveSubscriberList.clear();
        this.#capturePassiveSubscriberList.clear();
    }

    #getSubscriberList(capture, passive) {
        if (capture) {
            if (passive) {
                return this.#capturePassiveSubscriberList;
            }
            return this.#captureSubscriberList;
        }
        if (passive) {
            return this.#passiveSubscriberList;
        }
        return this.#normalSubscriberList;
    }

    #addEventListeners(target) {
        for (const [name, handler] of this.#normalSubscriberList) {
            target.addEventListener(name, handler);
        }
        for (const [name, handler] of this.#captureSubscriberList) {
            target.addEventListener(name, handler, {capture: true});
        }
        for (const [name, handler] of this.#passiveSubscriberList) {
            target.addEventListener(name, handler, {passive: true});
        }
        for (const [name, handler] of this.#capturePassiveSubscriberList) {
            target.addEventListener(name, handler, {
                capture: true,
                passive: true
            });
        }
    }

    #removeEventListeners(target) {
        for (const [name, handler] of this.#normalSubscriberList) {
            target.removeEventListener(name, handler);
        }
        for (const [name, handler] of this.#captureSubscriberList) {
            target.removeEventListener(name, handler, {capture: true});
        }
        for (const [name, handler] of this.#passiveSubscriberList) {
            target.removeEventListener(name, handler, {passive: true});
        }
        for (const [name, handler] of this.#capturePassiveSubscriberList) {
            target.removeEventListener(name, handler, {
                capture: true,
                passive: true
            });
        }
    }

}
