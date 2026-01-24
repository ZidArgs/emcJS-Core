import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./NumberInput.js.html" assert {type: "html"};
import STYLE from "./NumberInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./NumberInput.js.json" assert {type: "json"};

export default class NumberInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
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
        this.registerTargetEventHandler(this.#inputEl, "input", () => {
            this.value = this.#inputEl.value;
        });
        /* --- */
        this.#upButtonEl = this.shadowRoot.getElementById("upButton");
        this.registerTargetEventHandler(this.#upButtonEl, "mousedown", (event) => {
            if (event.button === 0) {
                this.#increaseValue();
            }
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#upButtonEl, "keydown", (event) => {
            if (event.key === " ") {
                this.#increaseValue();
            }
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#upButtonEl, "touchstart", (event) => {
            this.#increaseValue();
            event.stopPropagation();
        });
        /* --- */
        this.#downButtonEl = this.shadowRoot.getElementById("downButton");
        this.registerTargetEventHandler(this.#downButtonEl, "mousedown", (event) => {
            if (event.button === 0) {
                this.#decreaseValue();
            }
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#downButtonEl, "keydown", (event) => {
            if (event.key === " ") {
                this.#decreaseValue();
            }
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#downButtonEl, "touchstart", (event) => {
            this.#decreaseValue();
            event.stopPropagation();
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        super.focus(options);
        this.#inputEl.focus(options);
    }

    set defaultValue(value) {
        this.setNumberAttribute("value", value);
    }

    get defaultValue() {
        return this.getNumberAttribute("value");
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

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
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
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "placeholder", "readonly", "min", "max"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", this.readonly);
                    safeSetAttribute(this.#upButtonEl, "readonly", this.readonly);
                    safeSetAttribute(this.#downButtonEl, "readonly", this.readonly);
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

    renderValue(value) {
        this.#inputEl.value = !isNaN(value) ? value : "";
    }

    #increaseValue() {
        const max = this.max;
        const currentValue = parseFloat(this.#inputEl.value) || 0;
        if (max == null || currentValue < max) {
            this.#inputEl.value = currentValue + 1;
        }
        this.value = this.#inputEl.value;
    }

    #decreaseValue() {
        const min = this.min;
        const currentValue = parseFloat(this.#inputEl.value) || 0;
        if (min == null || currentValue > min) {
            this.#inputEl.value = currentValue - 1;
        }
        this.value = this.#inputEl.value;
    }

}

FormElementRegistry.register("NumberInput", NumberInput);
customElements.define("emc-input-number", NumberInput);
registerFocusable("emc-input-number");
