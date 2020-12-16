import AnyState from "./AnyState.js";

export default class BoolState extends AnyState {

    constructor() {
        super();
        super.value = "";
    }

    set value(value) {
        super.value = value.toString();
    }

    get value() {
        return super.value;
    }

}
