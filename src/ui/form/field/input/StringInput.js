import FormField from "../FormField.js";
import "../components/InputResetButton.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import FormFieldRegistry from "../../../../data/registry/FormFieldRegistry.js";
import TPL from "./StringInput.js.html" assert {type: "html"};
import STYLE from "./StringInput.js.css" assert {type: "css"};

export default class StringInput extends FormField {

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

FormFieldRegistry.register("string", StringInput);
FormFieldRegistry.setDefault(StringInput);
customElements.define("emc-input-string", StringInput);
