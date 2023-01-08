import AbstractFormInput from "./AbstractFormInput.js";
import "./components/InputResetButton.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import FormElementRegistry from "../../../data/registry/FormElementRegistry.js";
import TPL from "./StringInput.js.html" assert {type: "html"};
import STYLE from "./StringInput.js.css" assert {type: "css"};

export default class StringInput extends AbstractFormInput {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#onInput();
        });
        this.#inputEl.addEventListener("change", (event) => {
            this.dispatchEvent(new Event("change", event));
        });
    }

    #onInput = debounce(() => {
        super.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        super.value = value;
        this.#inputEl.value = value;
    }

    get value() {
        return this.#inputEl.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.value = newValue;
                }
            } break;
        }
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    revalidate() {
        if (this.#inputEl.value == "") {
            this.#inputEl.classList.add("invalid");
            return "required";
        }
        const error = super.revalidate();
        if (error != "") {
            this.#inputEl.classList.add("invalid");
        } else {
            this.#inputEl.classList.remove("invalid");
        }
        return error;
    }

}

FormElementRegistry.register("string", StringInput);
FormElementRegistry.setDefault(StringInput);
customElements.define("emc-input-string", StringInput);
