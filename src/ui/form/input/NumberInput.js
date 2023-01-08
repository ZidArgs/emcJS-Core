import AbstractFormInput from "./AbstractFormInput.js";
import "./components/InputResetButton.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import FormElementRegistry from "../../../data/registry/FormElementRegistry.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};

// FIXME deletes contents on "." input (maybe on "," if "." is decimal seperator)

export default class NumberInput extends AbstractFormInput {

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
        const value = parseFloat(this.#inputEl.value);
        return !isNaN(value) ? value : 0;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    const value = parseFloat(newValue);
                    this.value = !isNaN(value) ? value : 0;
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

FormElementRegistry.register("number", NumberInput);
customElements.define("emc-input-number", NumberInput);
