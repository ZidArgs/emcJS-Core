import AnyState from "./AnyState.js";

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
