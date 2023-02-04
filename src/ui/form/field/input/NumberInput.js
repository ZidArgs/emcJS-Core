import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    saveSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./NumberInput.js.form-config.json" assert {type: "json"};

export default class NumberInput extends AbstractFormInput {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

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
        this.#inputEl.addEventListener("change", () => {
            this.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#inputEl.value = value;
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#inputEl.value = isNaN(value) ? "" : value;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        const convertedValue = parseFloat(value ?? this.defaultValue);
        this.#inputEl.value = !isNaN(convertedValue) ? convertedValue : "";
        super.value = value != null ? parseFloat(value) : null;
    }

    get value() {
        const value = super.value;
        if (value == null || value === "") {
            return Number.NaN;
        }
        return parseFloat(value);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "min", "max", "readonly", "autocomplete"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                    }
                }
            } break;
            case "min":
            case "max":
            case "readonly":
            case "autocomplete": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
        }
    }

    setCustomValidity(message) {
        super.setCustomValidity(message, this.#inputEl);
    }

    revalidate() {
        const value = this.value;
        if (this.#inputEl.value !== "" && isNaN(value)) {
            return "Please enter a valid number";
        }
        return super.revalidate();
    }

}

FormElementRegistry.register("NumberInput", NumberInput);
customElements.define("emc-field-input-number", NumberInput);
