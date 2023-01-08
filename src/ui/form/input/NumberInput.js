import AbstractFormInput from "./AbstractFormInput.js";
import "./components/InputResetButton.js";
import "../../i18n/I18nInput.js";
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

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        if (this.#inputEl != null) {
            this.#inputEl.focus(options);
        }
    }

    #onInput = debounce(() => {
        super.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        value = parseFloat(value);
        value = !isNaN(value) ? value : 0;
        this.#inputEl.value = value;
        super.value = value;
    }

    get value() {
        return parseFloat(this.#inputEl.value);
    }

    static get observedAttributes() {
        return ["value", "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("value", newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("readonly", newValue);
                }
            } break;
        }
    }

    setCustomValidity(message) {
        if (typeof message === "string" && message !== "") {
            this.internals.setValidity({customError: true}, message, this.#inputEl);
        } else {
            this.internals.setValidity({}, "");
        }
    }

    revalidate() {
        if (isNaN(this.value)) {
            return "Please enter a valid number";
        }
        return super.revalidate();
    }

}

FormElementRegistry.register("number", NumberInput);
customElements.define("emc-input-number", NumberInput);
