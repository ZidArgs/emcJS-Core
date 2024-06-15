import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/builtin/I18nInput.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./NumberInput.js.json" assert {type: "json"};

export default class NumberInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #inputEl;

    #upButtonEl;

    #downButtonEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#onInput();
        });
        /* --- */
        this.#upButtonEl = this.shadowRoot.getElementById("upButton");
        this.#upButtonEl.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                this.#increaseValue();
            }
            event.stopPropagation();
        });
        this.#upButtonEl.addEventListener("keydown", (event) => {
            if (event.key === " ") {
                this.#increaseValue();
            }
            event.stopPropagation();
        });
        this.#upButtonEl.addEventListener("touchstart", (event) => {
            this.#increaseValue();
            event.stopPropagation();
        });
        /* --- */
        this.#downButtonEl = this.shadowRoot.getElementById("downButton");
        this.#downButtonEl.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                this.#decreaseValue();
            }
            event.stopPropagation();
        });
        this.#downButtonEl.addEventListener("keydown", (event) => {
            if (event.key === " ") {
                this.#decreaseValue();
            }
            event.stopPropagation();
        });
        this.#downButtonEl.addEventListener("touchstart", (event) => {
            this.#decreaseValue();
            event.stopPropagation();
        });
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        value = parseFloat(value);
        if (isNaN(value)) {
            super.value = null;
        } else {
            super.value = value;
        }
    }

    get value() {
        const value = super.value;
        if (value == null) {
            return null;
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

    set spinner(value) {
        this.setBooleanAttribute("spinner", value);
    }

    get spinner() {
        return this.getBooleanAttribute("spinner");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "placeholder", "readonly", "autocomplete", "min", "max"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
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
            case "min":
            case "max": {
                if (oldValue != newValue) {
                    this.revalidate();
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value;
        if (value != null) {
            if (isNaN(value)) {
                return "Please enter a valid number";
            }
            const min = this.min;
            const max = this.max;
            if ((min != null && value < min) || (max != null && value > max)) {
                return `The Value must be between {{0::${this.min}}} and {{1::${this.max}}} (inclusive)`;
            }
        }
        return super.checkValid();
    }

    applyValueAttribute(value) {
        safeSetAttribute(this.#inputEl, "value", value ?? "");
    }

    renderValue(value) {
        this.#inputEl.value = !isNaN(value) ? value : "";
    }

    #increaseValue() {
        const max = this.max;
        const currentValue = parseFloat(this.#inputEl.value) || 0;
        if (max == null || currentValue < max) {
            this.#inputEl.value = currentValue + 1;
        }
        this.#onInput();
    }

    #decreaseValue() {
        const min = this.min;
        const currentValue = parseFloat(this.#inputEl.value) || 0;
        if (min == null || currentValue > min) {
            this.#inputEl.value = currentValue - 1;
        }
        this.#onInput();
    }

}

FormElementRegistry.register("NumberInput", NumberInput);
customElements.define("emc-input-number", NumberInput);
registerFocusable("emc-input-number");
