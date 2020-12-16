import AnyState from "./AnyState.js";

const MAX = new WeakMap();
const MIN = new WeakMap();

function parseNumber(value, def = 0) {
    const result = parseInt(value);
    if (isNaN(result)) {
        return def;
    }
    return result;
}

export default class IntegerState extends AnyState {

    constructor(min, max) {
        super();
        MIN.set(this, parseNumber(min, Number.MIN_SAFE_INTEGER));
        MAX.set(this, parseNumber(max, Number.MAX_SAFE_INTEGER));
        super.value = 0;
    }

    set min(value) {
        value = parseNumber(value, Number.MIN_VALUE);
        const max = MAX.get(this);
        if (value > max) {
            value = max;
        }
        MIN.set(this, value);
        if (this.value < value) {
            super.value = value;
        }
    }

    get min() {
        return MIN.get(this);
    }

    set max(value) {
        value = parseNumber(value, Number.MAX_VALUE);
        const min = MIN.get(this);
        if (value < min) {
            value = min;
        }
        MAX.set(this, value);
        if (this.value > value) {
            super.value = value;
        }
    }

    get max() {
        return MAX.get(this);
    }

    set value(value) {
        value = parseNumber(value);
        const max = MAX.get(this);
        const min = MIN.get(this);
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

}
