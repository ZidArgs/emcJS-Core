import AbstractFormElement from "../../AbstractFormElement.js";
import "../../../i18n/builtin/I18nTextarea.js";
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
import TPL from "./TextInput.js.html" assert {type: "html"};
import STYLE from "./TextInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./TextInput.js.json" assert {type: "json"};

// TODO add maxLength - don't accept further input
// TODO add minLength - validation
export default class TextInput extends AbstractFormElement {

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

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
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

FormElementRegistry.register("TextInput", TextInput);
customElements.define("emc-input-text", TextInput);
