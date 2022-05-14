import LogicCompiler from "./LogicCompiler.js";

export default class LogicHandler extends EventTarget {

    #storage = null;

    #value = true;

    #logic = null;

    constructor(storage, logic = true) {
        super();
        this.#storage = storage;
        if (typeof logic == "object") {
            /* LOGIC */
            this.#logic = LogicCompiler.compile(logic);
            this.#value = !!this.#logic(ref => this.#storage.get(ref));
            this.#storage.addEventListener("change", () => this.update());
        } else if (logic != null) {
            this.#logic = logic;
            this.#value = !!logic;
        }
    }

    update() {
        if (typeof this.#logic == "function") {
            const value = !!this.#logic(ref => this.#storage.get(ref));
            if (this.#value != value) {
                this.#value = value;
                const event = new Event("change");
                event.value = value;
                this.dispatchEvent(event);
            }
        }
    }

    get value() {
        return !!this.#value;
    }

}
