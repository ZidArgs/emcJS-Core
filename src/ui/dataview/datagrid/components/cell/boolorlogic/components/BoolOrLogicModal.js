import Modal from "../../../../../../modal/Modal.js";
import "../../../../../../form/button/Button.js";
import "../../../../../../form/element/input/boolorlogic/BoolOrLogicInput.js";
import TPL from "./BoolOrLogicModal.js.html" assert {type: "html"};
import STYLE from "./BoolOrLogicModal.js.css" assert {type: "css"};

// TODO use ModalDialog instead
export default class BoolOrLogicModal extends Modal {

    #inputEl;

    #footerEl;

    #submitEl;

    #cancelEl;

    constructor(name) {
        if (typeof name === "string" && name !== "") {
            super(`Edit logic: ${name}`);
        } else {
            super("Edit logic");
        }
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#footerEl = this.shadowRoot.getElementById("footer");

        this.#inputEl = els.getElementById("input");
        this.append(this.#inputEl);

        this.#cancelEl = els.getElementById("cancel");
        this.registerTargetEventHandler(this.#cancelEl, "click", () => this.cancel());
        this.#footerEl.append(this.#cancelEl);

        this.#submitEl = els.getElementById("submit");
        this.registerTargetEventHandler(this.#submitEl, "click", () => this.submit());
        this.#footerEl.append(this.#submitEl);
    }

    set caption(value) {
        if (typeof value === "string" && value !== "") {
            super.caption = `Edit logic: ${value}`;
        } else {
            super.caption = "Edit logic";
        }
    }

    get caption() {
        return super.caption;
    }

    submit() {
        if (this.#inputEl.checkValidity()) {
            this.dispatchEvent(new Event("submit"));
            this.remove();
        }
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

    set nullable(value) {
        this.#inputEl.nullable = value;
        this.#inputEl.required = !value;
    }

    get nullable() {
        return this.#inputEl.nullable;
    }

    addOperatorGroup(...groupList) {
        this.#inputEl.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#inputEl.removeOperatorGroup(...groupList);
    }

}

customElements.define("emc-input-boolorlogic-modal", BoolOrLogicModal);
