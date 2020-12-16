import Helper from "../util/Helper.js";

const STATE = new WeakMap();

export default class AnyState extends EventTarget {

    constructor() {
        super();
    }

    set value(value) {
        const state = STATE.get(this);
        if (!Helper.isEqual(state, value)) {
            STATE.set(this, value);
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get value() {
        return STATE.get(this);
    }

}
