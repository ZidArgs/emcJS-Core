import AnyState from "./AnyState.js";

export default class BoolState extends AnyState {

    constructor() {
        super();
        super.value = "";
    }

    set value(value) {
        if (typeof value != "string") {
            value = `${value}`;
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

}
