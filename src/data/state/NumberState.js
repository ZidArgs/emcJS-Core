import AnyState from "./AnyState.js";

const MAX = new WeakMap();
const MIN = new WeakMap();

function parseNumber(value) {
    const result = parseFloat(value);
    if (isNaN(result)) {
        console.warn("value is not a number");
        return;
    }
    return result;
}

export default class NumberState extends AnyState {

    constructor(min, max) {
        super();
        MIN.set(this, parseNumber(min) ?? Number.MIN_VALUE);
        MAX.set(this, parseNumber(max) ?? Number.MAX_VALUE);
        super.value = 0;
    }

    set min(value) {
        value = parseNumber(value);
        if (value != null) {
            const max = MAX.get(this);
            if (value > max) {
                value = max;
            }
            MIN.set(this, value);
            if (this.value < value) {
                super.value = value;
            }
        }
    }

    get min() {
        return MIN.get(this);
    }

    set max(value) {
        value = parseNumber(value);
        if (value != null) {
            const min = MIN.get(this);
            if (value < min) {
                value = min;
            }
            MAX.set(this, value);
            if (this.value > value) {
                super.value = value;
            }
        }
    }

    get max() {
        return MAX.get(this);
    }

    set value(value) {
        value = parseNumber(value);
        if (value != null) {
            const max = MAX.get(this);
            const min = MIN.get(this);
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }
            super.value = value;
        }
    }

    get value() {
        return super.value;
    }

}
