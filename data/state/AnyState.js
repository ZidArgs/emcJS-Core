const STATE = new WeakMap();

function isEqual(a, b) {
    if (Object.is(a, b)) {
        return true;
    }
    if (typeof a != "object") {
        return false;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() == b.getTime();
    }
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length != b.length) {
            return false;
        }
        return a.every((i, j) => isEqual(i, b[j]));
    } else {
        if (Array.isArray(b)) {
            return false;
        }
        const c = Object.keys(a);
        if (c.length != Object.keys(b).length) {
            return false;
        }
        return c.every(i => b[i] != null && isEqual(a[i], b[i]));
    }
}

export default class AnyState extends EventTarget {

    constructor() {
        super();
    }

    set value(value) {
        const state = STATE.get(this);
        if (!isEqual(state, value)) {
            STATE.set(this, value);
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get value() {
        return STATE.get(this);
    }

}
