import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./NumberInput.js.json" assert {type: "json"};

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

    set min(value) {
        this.setNumberAttribute("min", value);
    }

    get min() {
        return this.getNumberAttribute("min");
    }

    set max(value) {
        this.setNumberAttribute("max", value);
    }

    get max() {
        return this.getNumberAttribute("max");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "readonly", "autocomplete"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                    }
                }
            } break;
            case "readonly":
            case "autocomplete": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value;
        if (this.#inputEl.value !== "") {
            if (isNaN(value)) {
                return "Please enter a valid number";
            }
            if ((this.min != null && this.#inputEl.value < this.min) || (this.max != null && this.#inputEl.value > this.max)) {
                return `Out of range. The Value must be between {{0::${this.min}}} and {{1::${this.max}}}`;
            }
        }
        return super.checkValid();
    }

}

FormElementRegistry.register("NumberInput", NumberInput);
customElements.define("emc-field-input-number", NumberInput);
