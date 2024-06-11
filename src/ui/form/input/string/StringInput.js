import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./StringInput.js.html" assert {type: "html"};
import STYLE from "./StringInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./StringInput.js.json" assert {type: "json"};

// TODO add maxLength - don't accept further input
// TODO add minLength - validation
// TODO add pattern (expected pattern as regexp) - validation
export default class StringInput extends AbstractFormElement {

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

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    connectedCallback() {
        super.connectedCallback();
        this.#inputEl.value = this.value;
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        this.#inputEl.value = this.value;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "placeholder", "readonly", "autocomplete"];
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
        }
    }

    applyValueAttribute(value) {
        safeSetAttribute(this.#inputEl, "value", value);
    }

    renderValue(value) {
        this.#inputEl.value = value;
    }

}

FormElementRegistry.register("StringInput", StringInput);
customElements.define("emc-input-string", StringInput);
