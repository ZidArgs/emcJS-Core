const TARGET = new WeakMap();
const SUBS = new WeakMap();

export default (CLAZZ) => class EventTargetMixin extends CLAZZ {

    constructor(...args) {
        super(...args);
        SUBS.set(this, new Map());
        TARGET.set(this, null);
    }

    switchTarget(newTarget) {
        const subs = SUBS.get(this);
        const oldTarget = TARGET.get(this);
        if (oldTarget != null) {
            subs.forEach(function(fn, name) {
                oldTarget.removeEventListener(name, fn);
            });
        }
        TARGET.set(this, newTarget);
        if (newTarget instanceof EventTarget && this.isConnected) {
            subs.forEach(function(fn, name) {
                newTarget.addEventListener(name, fn);
            });
        }
    }

    getTarget() {
        return TARGET.get(this);
    }

    addEventListener(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.addEventListener(n, fn));
        } else {
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (target != null) {
                if (subs.has(name)) {
                    target.removeEventListener(name, fn);
                }
                if (this.isConnected) {
                    target.addEventListener(name, fn);
                }
            }
            subs.set(name, fn);
        }
    }

    removeEventListener(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.removeEventListener(n, fn));
        } else {
            const subs = SUBS.get(this);
            const target = TARGET.get(this);
            if (target != null) {
                if (subs.has(name)) {
                    target.removeEventListener(name, fn);
                    subs.delete(name);
                }
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const target = TARGET.get(this);
        if (target != null) {
            const subs = SUBS.get(this);
            subs.forEach(function(fn, name) {
                target.addEventListener(name, fn);
            });
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        const target = TARGET.get(this);
        if (target != null) {
            const subs = SUBS.get(this);
            subs.forEach(function(fn, name) {
                target.removeEventListener(name, fn);
            });
        }
    }

}
