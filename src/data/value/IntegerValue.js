import {
    delimitInteger,
    parseSafeInteger
} from "../../util/helper/number/Integer.js";
import AnyState from "./AnyValue.js";

function parseNumber(value) {
    const result = parseSafeInteger(value);
    if (isNaN(result)) {
        console.warn(`value "${value}" is not a number`);
        return;
    }
    return result;
}

/**
 * A state containing an integer value.
 * If the value gets updated, it fires a change event.
 */
export default class IntegerState extends AnyState {

    #min = 0;

    #max = 0;

    constructor(value, min, max) {
        value = parseNumber(value) ?? 0;
        min = parseNumber(min) ?? Number.MIN_SAFE_INTEGER;
        max = parseNumber(max) ?? Number.MAX_SAFE_INTEGER;
        super(delimitInteger(0, min, max));
        this.#min = min;
        this.#max = max;
    }

    set min(value) {
        value = parseNumber(value);
        if (value != null) {
            if (value > this.#max) {
                value = this.#max;
            }
            this.#min = value;
            if (this.value < value) {
                super.value = value;
            }
        }
    }

    get min() {
        return this.#min;
    }

    set max(value) {
        value = parseNumber(value);
        if (value != null) {
            if (value < this.#min) {
                value = this.#min;
            }
            this.#max = value;
            if (this.value > value) {
                super.value = value;
            }
        }
    }

    get max() {
        return this.#max;
    }

    set value(value) {
        value = parseNumber(value);
        if (value != null) {
            super.value = delimitInteger(value, this.#min, this.#max);
        }
    }

    get value() {
        return super.value;
    }

}
