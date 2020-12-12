import AnyState from "./AnyState.js";

export default class BoolState extends AnyState {

    constructor() {
        super();
        super.value = false;
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = false;
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

}
