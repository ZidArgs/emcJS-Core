import AnyState from "./AnyValue.js";

/**
 * A state containing a boolean value.
 * If the value gets updated, it fires a change event.
 */
export default class BoolState extends AnyState {

    constructor(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        super(value);
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

}
