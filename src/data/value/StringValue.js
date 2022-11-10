import AnyState from "./AnyValue.js";

/**
 * A state containing a string value.
 * If the value gets updated, it fires a change event.
 */
export default class BoolState extends AnyState {

    constructor(value) {
        super(value.toString());
    }

    set value(value) {
        super.value = value.toString();
    }

    get value() {
        return super.value;
    }

}
