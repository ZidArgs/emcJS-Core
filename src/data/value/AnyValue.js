import {isEqual} from "../../util/helper/Comparator.js";

/**
 * A state containing a value of any kind.
 * If the value gets updated, it fires a change event.
 */
export default class AnyState extends EventTarget {

    #state;

    constructor(value) {
        super();
        this.#state = value;
    }

    set value(value) {
        if (!isEqual(this.#state, value)) {
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
