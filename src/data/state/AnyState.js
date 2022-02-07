import Helper from "../../util/helper/Helper.js";

export default class AnyState extends EventTarget {

    #state;

    constructor(value) {
        super();
        this.#state = value;
    }

    set value(value) {
        if (!Helper.isEqual(this.#state, value)) {
            this.#state = value;
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get value() {
        return this.#state;
    }

}
