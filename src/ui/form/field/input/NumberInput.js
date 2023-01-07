import FormInput from "../FormInput.js";
import "../components/InputResetButton.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import FormInputRegistry from "../../../../data/registry/FormInputRegistry.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};

// FIXME deletes contents on "." input (maybe on "," if "." is decimal seperator)

export default class NumberInput extends FormInput {

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
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        const value = parseFloat(this.getAttribute("value"));
        return !isNaN(value) ? value : undefined;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value":
                if (oldValue != newValue) {
                    this.#inputEl.value = newValue;
                }
                break;
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

FormInputRegistry.register("number", NumberInput);
customElements.define("emc-input-number", NumberInput);
