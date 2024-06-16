import AbstractFormElement from "../../AbstractFormElement.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../../util/helper/html/getFocusableElements.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/builtin/I18nInput.js";
import TPL from "./RangeInput.js.html" assert {type: "html"};
import STYLE from "./RangeInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./RangeInput.js.json" assert {type: "json"};

// TODO react to to change instead of input on number to update slider
// TODO react to keypress for up and down arrow on number to update slider
export default class RangeInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #inputEl;

    #inputContainerEl;

    #numberEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputContainerEl = this.shadowRoot.getElementById("input-container");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", (event) => {
            event.stopPropagation();
            this.#numberEl.value = this.#inputEl.value;
            this.#applyValueToBar(this.#inputEl.value);
            const ev = new Event("input", {bubbles: true});
            this.dispatchEvent(ev);
            this.#onInput();
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
            this.#onInput();
        });
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#numberEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        super.value = value != null ? parseInt(value) : null;
    }

    get value() {
        return super.value ?? 0;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "min", "max", "scratched"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
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

    applyValueAttribute(value) {
        safeSetAttribute(this.#inputEl, "value", value);
        safeSetAttribute(this.#numberEl, "value", value);
    }

    renderValue(value) {
        this.#inputEl.value = value ?? 0;
        this.#numberEl.value = value ?? 0;
        this.#applyValueToBar(value);
    }

    #setRange() {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            const parts = max - min;
            this.#inputContainerEl.style.setProperty("--range-parts", parts);
            this.#applyScratchValue();
        } else {
            this.#inputContainerEl.style.setProperty("--range-parts", 1);
            this.#applyScratchValue();
        }
    }

    #applyValueToBar(value) {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            if (value !== "") {
                this.#inputContainerEl.style.setProperty("--range-value", value - min);
                this.#numberEl.value = value;
            } else {
                const pos = (max - min) / 2;
                this.#inputContainerEl.style.setProperty("--range-value", pos - min);
                this.#numberEl.value = pos;
            }
        } else {
            this.#inputContainerEl.style.setProperty("--range-value", 0);
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
                    this.#inputContainerEl.classList.add("scratched");
                    return;
                }
            }
        }
        this.#inputContainerEl.classList.remove("scratched");
    }

}

FormElementRegistry.register("RangeInput", RangeInput);
customElements.define("emc-input-range", RangeInput);
registerFocusable("emc-input-range");
