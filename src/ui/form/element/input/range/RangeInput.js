import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import "../../../../i18n/builtin/I18nInput.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./RangeInput.js.html" assert {type: "html"};
import STYLE from "./RangeInput.js.css" assert {type: "css"};
import {
    debounce
} from "../../../../../util/Debouncer.js";

export default class RangeInput extends CustomFormElementDelegating {

    #inputEl;

    #numberEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", (event) => {
            event.stopPropagation();
            this.#numberEl.value = this.#inputEl.value;
            this.#applyValueToBar(this.#inputEl.value);
            const ev = new Event("input", {bubbles: true});
            this.dispatchEvent(ev);
            this.#notifyChange();
        });
        new ResizeObserver(() => {
            this.#applyScratchValue();
        }).observe(this.#inputEl);
        /* --- */
        this.#numberEl = this.shadowRoot.getElementById("number");
        this.#numberEl.addEventListener("input", (event) => {
            event.stopPropagation();
            this.#inputEl.value = this.#numberEl.value;
            this.#applyValueToBar(this.#inputEl.value);
            const ev = new Event("input", {bubbles: true});
            this.dispatchEvent(ev);
            this.#notifyChange();
        });
    }

    connectedCallback() {
        const value = this.value;
        const convertedValue = parseInt(value) || 0;
        this.#inputEl.value = convertedValue;
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
        this.#setRange();
    }

    formDisabledCallback(disabled) {
        this.#inputEl.disabled = disabled;
        this.#numberEl.disabled = disabled;
    }

    formResetCallback() {
        const value = this.value;
        const convertedValue = parseInt(value) || 0;
        this.#inputEl.value = convertedValue;
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        const convertedValue = parseInt(value ?? this.defaultValue) || 0;
        this.#inputEl.value = convertedValue;
        this.#numberEl.value = convertedValue;
        this.#applyValueToBar(convertedValue);
    }

    get value() {
        return this.#inputEl.value;
    }

    static get observedAttributes() {
        return ["value", "min", "max", "scratched"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    safeSetAttribute(this.#numberEl, "value", newValue);
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
                    safeSetAttribute(this.#inputEl, name, newValue);
                    safeSetAttribute(this.#numberEl, name, newValue);
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

    #setRange() {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            const parts = max - min;
            this.#inputEl.style.setProperty("--range-parts", parts);
            this.#applyScratchValue();
        } else {
            this.#inputEl.style.setProperty("--range-parts", 1);
            this.#applyScratchValue();
        }
    }

    #applyValueToBar(value) {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            if (value !== "") {
                this.#inputEl.style.setProperty("--range-value", value - min);
                this.#numberEl.value = value;
            } else {
                const pos = (max - min) / 2;
                this.#inputEl.style.setProperty("--range-value", pos - min);
                this.#numberEl.value = pos;
            }
        } else {
            this.#inputEl.style.setProperty("--range-value", 0);
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

    #notifyChange = debounce(() => {
        const ev = new Event("change", {bubbles: true});
        this.dispatchEvent(ev);
    }, 300);

}

customElements.define("emc-input-range", RangeInput);
