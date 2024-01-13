import Modal from "../../../../../modal/Modal.js";
import "../../../../button/Button.js";
import "../../../../field/input/BoolOrLogicInput.js";
import TPL from "./BoolOrLogicModal.js.html" assert {type: "html"};
import STYLE from "./BoolOrLogicModal.js.css" assert {type: "css"};

// TODO use ModalDialog instead
export default class BoolOrLogicModal extends Modal {

    #inputEl;

    constructor(name) {
        if (typeof name === "string" && name !== "") {
            super(`Edit logic: ${name}`);
        } else {
            super("Edit logic");
        }
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");

        this.#inputEl = els.getElementById("input");
        this.append(this.#inputEl);

        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());
        footerEl.append(cancelEl);

        const submitEl = els.getElementById("submit");
        submitEl.addEventListener("click", () => this.submit());
        footerEl.append(submitEl);
    }

    setTitle(name) {
        if (typeof name === "string" && name !== "") {
            super.setTitle(`Edit logic: ${name}`);
        } else {
            super.setTitle("Edit logic");
        }
    }

    submit() {
        this.dispatchEvent(new Event("submit"));
        this.remove();
    }

    cancel() {
        this.dispatchEvent(new Event("cancel"));
        this.remove();
    }

    set name(value) {
        this.#inputEl.name = value;
    }

    get name() {
        return this.#inputEl.name;
    }

    set value(value) {
        this.#inputEl.value = value;
    }

    get value() {
        return this.#inputEl.value;
    }

    addOperatorGroup(...groupList) {
        this.#inputEl.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#inputEl.removeOperatorGroup(...groupList);
    }

}

customElements.define("emc-input-boolorlogic-modal", BoolOrLogicModal);
