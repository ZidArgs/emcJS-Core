import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../element/input/range/RangeInput.js";
import TPL from "./RangeInput.js.html" assert {type: "html"};
import STYLE from "./RangeInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./RangeInput.js.json" assert {type: "json"};

export default class RangeInput extends AbstractFormInput {

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
            this.#onInput();
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        const convertedValue = parseInt(value) || 0;
        this.#inputEl.value = convertedValue;
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        const convertedValue = parseInt(value) || 0;
        this.#inputEl.value = convertedValue;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        const convertedValue = parseInt(value ?? this.defaultValue) || 0;
        this.#inputEl.value = convertedValue;
        super.value = value != null ? parseInt(value) : null;
    }

    get value() {
        const value = super.value;
        return parseInt(value ?? this.defaultValue) || 0;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "min", "max", "scratched"];
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
            case "min":
            case "max":
            case "scratched": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

}

FormElementRegistry.register("RangeInput", RangeInput);
customElements.define("emc-field-input-range", RangeInput);
