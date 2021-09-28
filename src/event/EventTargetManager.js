const TARGET = new WeakMap();
const SUBS = new WeakMap();
const ACTIVE = new WeakMap();

export default class EventTargetManager {

    constructor(target = null, active = true) {
        if (target != null && !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget or null");
        }
        SUBS.set(this, new Map());
        TARGET.set(this, target);
        ACTIVE.set(this, !!active);
    }

    setActive(value) {
        const active = ACTIVE.get(this);
        value = !!value;
        if (active != value) {
            const target = TARGET.get(this);
            if (target != null) {
                const subs = SUBS.get(this);
                ACTIVE.set(this, value);
                if (value) {
                    subs.forEach(function(handler, name) {
                        target.addEventListener(name, handler, {capture: true});
                    });
                } else {
                    subs.forEach(function(handler, name) {
                        target.removeEventListener(name, handler, {capture: true});
                    });
                }
            }
        }
    }

    switchTarget(target) {
        if (target != null && !(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget or null");
        }
        const active = ACTIVE.get(this);
        const subs = SUBS.get(this);
        const oldTarget = TARGET.get(this);
        if (oldTarget != null) {
            subs.forEach(function(handler, name) {
                oldTarget.removeEventListener(name, handler, {capture: true});
            });
        }
        TARGET.set(this, target);
        if (active && target != null) {
            subs.forEach(function(handler, name) {
                target.addEventListener(name, handler, {capture: true});
            });
        }
    }

    getTarget() {
        return TARGET.get(this);
    }

    set(name, handler) {
        if (typeof handler != "function") {
            throw new TypeError(`handler parameter must be of type "function" but was "${typeof handler}"`);
        }
        if (Array.isArray(name)) {
            name.forEach(n => this.set(n, handler));
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            const subs = SUBS.get(this);
            const active = ACTIVE.get(this);
            const target = TARGET.get(this);
            if (active && target != null) {
                if (subs.has(name)) {
                    const oldhandler = subs.get(name);
                    target.removeEventListener(name, oldhandler, {capture: true});
                }
                target.addEventListener(name, handler, {capture: true});
            }
            subs.set(name, handler);
        }
    }

    delete(name) {
        if (Array.isArray(name)) {
            name.forEach(n => this.delete(n));
        } else {
            if (typeof name != "string") {
                throw new TypeError(`name parameter must be of type "string" but was "${typeof name}"`);
            }
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (target != null) {
                if (subs.has(name)) {
                    const oldhandler = subs.get(name);
                    target.removeEventListener(name, oldhandler, {capture: true});
                }
            }
            subs.delete(name);
        }
    }

    clear() {
        const subs = SUBS.get(this);
        const target = TARGET.get(this);
        if (target != null) {
            subs.forEach(function(handler, name) {
                target.removeEventListener(name, handler, {capture: true});
            });
        }
        subs.clear();
    }

}
