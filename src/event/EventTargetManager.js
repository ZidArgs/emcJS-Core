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
                    subs.forEach(function(fn, name) {
                        target.addEventListener(name, fn);
                    });
                } else {
                    subs.forEach(function(fn, name) {
                        target.removeEventListener(name, fn);
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
            subs.forEach(function(fn, name) {
                oldTarget.removeEventListener(name, fn);
            });
        }
        TARGET.set(this, target);
        if (active) {
            subs.forEach(function(fn, name) {
                target.addEventListener(name, fn);
            });
        }
    }

    getTarget() {
        return TARGET.get(this);
    }

    set(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.setEventListener(n, fn));
        } else {
            const subs = SUBS.get(this);
            const active = ACTIVE.get(this);
            const target = TARGET.get(this);
            if (active && target != null) {
                if (subs.has(name)) {
                    target.removeEventListener(name, fn);
                }
                target.addEventListener(name, fn);
            }
            subs.set(name, fn);
        }
    }

    delete(name) {
        if (Array.isArray(name)) {
            name.forEach(n => this.deleteEventListener(n));
        } else {
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (target != null) {
                if (subs.has(name)) {
                    const oldFn = subs.get(name);
                    target.removeEventListener(name, oldFn);
                }
            }
            subs.delete(name);
        }
    }

    clear() {
        const subs = SUBS.get(this);
        const target = TARGET.get(this);
        if (target != null) {
            subs.forEach(function(fn, name) {
                target.removeEventListener(name, fn);
            });
        }
        subs.clear();
    }

}
