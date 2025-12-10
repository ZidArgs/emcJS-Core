export default class EventTargetManager {

    #normalSubscriberList = new Map();

    #captureSubscriberList = new Map();

    #passiveSubscriberList = new Map();

    #capturePassiveSubscriberList = new Map();

    #target;

    #active;

    constructor(target = null, active = true) {
        if (target != null && !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget or null");
        }
        this.#target = target;
        this.#active = !!active;
    }

    set active(value) {
        value = !!value;
        if (this.#active != value) {
            if (this.#target != null) {
                this.#active = value;
                if (value) {
                    this.#addEventListeners(this.#target);
                } else {
                    this.#removeEventListeners(this.#target);
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
            this.#removeEventListeners(this.#target);
        }
        this.#target = target;
        if (this.#active && this.#target != null) {
            this.#addEventListeners(this.#target);
        }
    }

    get target() {
        return this.#target;
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
            if (this.#active && this.#target != null) {
                if (subscriberList.has(name)) {
                    const oldhandler = subscriberList.get(name);
                    this.#target.removeEventListener(name, oldhandler, {
                        capture,
                        passive
                    });
                }
                this.#target.addEventListener(name, handler, {
                    capture,
                    passive
                });
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
            if (this.#target != null) {
                if (subscriberList.has(name)) {
                    const oldhandler = subscriberList.get(name);
                    this.#target.removeEventListener(name, oldhandler, {
                        capture,
                        passive
                    });
                }
            }
            subscriberList.delete(name);
        }
    }

    clear() {
        if (this.#target != null) {
            this.#removeEventListeners(this.#target);
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
