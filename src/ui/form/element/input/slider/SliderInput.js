import AbstractFormElement from "../../AbstractFormElement.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./SliderInput.js.html" assert {type: "html"};
import STYLE from "./SliderInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SliderInput.js.json" assert {type: "json"};

export default class SliderInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #inputEl;

    #containerEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.registerTargetEventHandler(this.#inputEl, "input", () => {
            const value = this.#inputEl.value;
            this.#applyValueToBar(value);
            this.value = value;
        });
        new ResizeObserver(() => {
            this.#applyGradationsValue();
        }).observe(this.#inputEl);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        super.focus(options);
        this.#inputEl.focus(options);
    }

    set value(value) {
        super.value = value != null ? parseInt(value) : null;
    }

    get value() {
        return super.value ?? 0;
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

    set gradations(value) {
        this.setBooleanAttribute("gradations", value);
    }

    get gradations() {
        return this.getBooleanAttribute("gradations");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "min", "max", "gradations"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "min":
            case "max": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                    this.#setRange();
                    this.#applyValueToBar(this.value);
                }
            } break;
            case "gradations": {
                if (oldValue != newValue) {
                    this.#applyGradationsValue();
                }
            } break;
        }
    }

    renderValue(value) {
        this.#inputEl.value = value ?? 0;
        this.#applyValueToBar(value);
    }

    #setRange() {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            const parts = max - min;
            this.#containerEl.style.setProperty("--range-parts", parts);
            this.#applyGradationsValue();
        } else {
            this.#containerEl.style.setProperty("--range-parts", 1);
            this.#applyGradationsValue();
        }
    }

    #applyValueToBar(value) {
        const min = parseInt(this.getAttribute("min") || "0");
        const max = parseInt(this.getAttribute("max") || "10");
        if (min < max) {
            if (value !== "") {
                this.#containerEl.style.setProperty("--range-value", value - min);
            } else {
                const pos = (max - min) / 2;
                this.#containerEl.style.setProperty("--range-value", pos - min);
            }
        } else {
            this.#containerEl.style.setProperty("--range-value", 0);
            this.#applyGradationsValue();
        }
    }

    // TODO add gradation increment value
    #applyGradationsValue() {
        if (this.gradations) {
            const min = parseInt(this.getAttribute("min") || "0");
            const max = parseInt(this.getAttribute("max") || "10");
            if (min < max) {
                const parts = max - min;
                if (parts < this.#inputEl.offsetWidth / 10) {
                    this.#containerEl.classList.add("gradations");
                    return;
                }
            }
        }
        this.#containerEl.classList.remove("gradations");
    }

}

FormElementRegistry.register("SliderInput", SliderInput);
customElements.define("emc-input-slider", SliderInput);
registerFocusable("emc-input-slider");
