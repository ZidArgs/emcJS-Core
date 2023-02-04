import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import TPL from "./RangeInput.js.html" assert {type: "html"};
import STYLE from "./RangeInput.js.css" assert {type: "css"};

export default class RangeInput extends AbstractFormInput {

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
        this.#inputEl.value = value;
        this.#numberEl.value = value;
        this.#applyValueToBar(value);
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
        this.#inputEl.value = value;
        this.#numberEl.value = value;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    get defaultValue() {
        return parseInt(super.defaultValue) || 0;
    }

    set value(value) {
        const convertedValue = parseInt(value ?? this.defaultValue) || 0;
        this.#inputEl.value = convertedValue;
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
        super.value = convertedValue;
    }

    get value() {
        const value = super.value;
        if (value == null || value === "") {
            return Number.NaN;
        }
        return parseFloat(value);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "min", "max", "scratched"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute(name, newValue);
                    this.#numberEl.setAttribute(name, newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                        this.#numberEl.value = value;
                        this.#applyValueToBar(this.value);
                        this.#setRange();
                    }
                }
            } break;
            case "min":
            case "max": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute(name, newValue);
                    this.#numberEl.setAttribute(name, newValue);
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

    revalidate() {
        const value = this.value;
        if (value !== "" && isNaN(value)) {
            return "Please enter a valid number";
        }
        return super.revalidate();
    }

    #setRange() {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        const parts = max - min;
        this.#fieldEl.style.setProperty("--range-parts", parts);
        this.#applyScratchValue();
    }

    #applyValueToBar(value) {
        const min = parseInt(this.getAttribute("min") || "0");
        if (value !== "") {
            this.#fieldEl.style.setProperty("--range-value", value - min);
            this.#numberEl.value = value;
        } else {
            const max = parseInt(this.getAttribute("max") || "10");
            const pos = (max - min) / 2;
            this.#fieldEl.style.setProperty("--range-value", pos - min);
            this.#numberEl.value = pos;
        }
    }

    #applyScratchValue() {
        this.#inputEl.classList.remove("scratched");
        const value = this.getAttribute("scratched");
        if (value != null && value != "false") {
            const min = parseInt(this.getAttribute("min") || "0");
            const max = parseInt(this.getAttribute("max") || "10");
            const parts = max - min;
            if (parts < this.#inputEl.offsetWidth / 10) {
                this.#inputEl.classList.add("scratched");
            }
        }
    }

}

FormElementRegistry.register("RangeInput", RangeInput);
customElements.define("emc-field-input-range", RangeInput);
