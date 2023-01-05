import FormField from "../FormField.js";
import "../components/InputResetButton.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import FormFieldRegistry from "../../../../data/registry/FormFieldRegistry.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};

export default class NumberInput extends FormField {

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
        const resetEl = this.shadowRoot.getElementById("reset");
        resetEl.addEventListener("click", () => {
            const event = new Event("reset");
            event.key = this.key;
            this.dispatchEvent(event);
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

    set resettable(value) {
        this.setAttribute("resettable", value);
    }

    get resettable() {
        return this.getAttribute("resettable");
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
            return "required";
        }
        return "";
    }

}

FormFieldRegistry.register("number", NumberInput);
customElements.define("emc-input-number", NumberInput);
