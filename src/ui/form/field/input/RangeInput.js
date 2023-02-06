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
    saveSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./RangeInput.js.html" assert {type: "html"};
import STYLE from "./RangeInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./RangeInput.js.form-config.json" assert {type: "json"};

export default class RangeInput extends AbstractFormInput {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #fieldEl;

    #inputEl;

    #numberEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#fieldEl = this.shadowRoot.getElementById("field");
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#applyValueToBar(this.#inputEl.value);
            this.#onInput();
        });
        this.#inputEl.addEventListener("change", () => {
            this.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
        });
        new ResizeObserver(() => {
            this.#applyScratchValue();
        }).observe(this.#inputEl);
        /* --- */
        this.#numberEl = this.shadowRoot.getElementById("number");
        this.#numberEl.addEventListener("input", () => {
            this.#inputEl.value = this.#numberEl.value;
            this.#applyValueToBar(this.#inputEl.value);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        const convertedValue = parseInt(value) || 0;
        this.#inputEl.value = convertedValue;
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
        this.#setRange();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#numberEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        const convertedValue = parseInt(value) || 0;
        this.#inputEl.value = convertedValue;
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
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
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
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
                    saveSetAttribute(this.#inputEl, "value", newValue);
                    saveSetAttribute(this.#numberEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                        this.#numberEl.value = value;
                        this.#applyValueToBar(this.value);
                    }
                }
            } break;
            case "min":
            case "max": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, name, newValue);
                    saveSetAttribute(this.#numberEl, name, newValue);
                    this.#setRange();
                    this.#applyValueToBar(this.value);
                }
            } break;
            case "scratched": {
                if (oldValue != newValue) {
                    this.#applyScratchValue();
                }
            } break;
        }
    }

    setCustomValidity(message) {
        super.setCustomValidity(message, this.#inputEl);
    }

    #setRange() {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            const parts = max - min;
            this.#fieldEl.style.setProperty("--range-parts", parts);
            this.#applyScratchValue();
        } else {
            this.#fieldEl.style.setProperty("--range-parts", 1);
            this.#applyScratchValue();
        }
    }

    #applyValueToBar(value) {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            if (value !== "") {
                this.#fieldEl.style.setProperty("--range-value", value - min);
                this.#numberEl.value = value;
            } else {
                const pos = (max - min) / 2;
                this.#fieldEl.style.setProperty("--range-value", pos - min);
                this.#numberEl.value = pos;
            }
        } else {
            this.#fieldEl.style.setProperty("--range-value", 0);
            this.#applyScratchValue();
        }
    }

    #applyScratchValue() {
        const value = this.getAttribute("scratched");
        if (value != null && value != "false") {
            const min = parseInt(this.getAttribute("min") || "0");
            const max = parseInt(this.getAttribute("max") || "10");
            if (min < max) {
                const parts = max - min;
                if (parts < this.#inputEl.offsetWidth / 10) {
                    this.#inputEl.classList.add("scratched");
                    return;
                }
            }
        }
        this.#inputEl.classList.remove("scratched");
    }

}

FormElementRegistry.register("RangeInput", RangeInput);
customElements.define("emc-field-input-range", RangeInput);
