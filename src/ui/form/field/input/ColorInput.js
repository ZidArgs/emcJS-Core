import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/I18nTooltip.js";
import "../../element/input/color/ColorInput.js";
import TPL from "./ColorInput.js.html" assert {type: "html"};
import STYLE from "./ColorInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ColorInput.js.json" assert {type: "json"};

const REGEX_HEX = /^#[0-9a-f]{6}$/;

export default class ColorInput extends AbstractFormInput {

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
        this.#inputEl.addEventListener("change", () => {
            const value = this.#inputEl.value;
            this.value = value;
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
        this.#inputEl.value = value;
    }

    validityCallback(message) {
        this.#inputEl.setCustomValidity(message);
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    getSubmitValue() {
        const value = this.value;
        if (value == null) {
            return "";
        }
        return value;
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
            case "autocomplete": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "autocomplete", newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", newValue);
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value;
        if (value != null && value !== "" && !REGEX_HEX.test(value)) {
            return "Please enter a valid hexadecimal color (#000000 - #FFFFFF)";
        }
        return super.checkValid();
    }

}

FormElementRegistry.register("ColorInput", ColorInput);
customElements.define("emc-field-input-color", ColorInput);
