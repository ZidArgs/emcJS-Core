import AnyState from "./AnyState.js";

const MAX = new WeakMap();
const MIN = new WeakMap();

export default class NumberState extends AnyState {

    constructor(max, min) {
        super();
        super.value = 0;
        if (typeof max != "number") max = 0;
        if (typeof min != "number") min = 0;
        MAX.set(this, max);
        MIN.set(this, min);
    }

    set max(value) {
        if (typeof value != "number" || isNaN(value)) {
            value = 0;
        }
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

    set min(value) {
        if (typeof value != "number" || isNaN(value)) {
            value = 0;
        }
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

    set value(value) {
        if (typeof value != "number" || isNaN(value)) {
            value = 0;
        }
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
