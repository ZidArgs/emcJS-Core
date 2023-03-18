import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nTextarea.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./TextInput.js.html" assert {type: "html"};
import STYLE from "./TextInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./TextInput.js.form-config.json" assert {type: "json"};

export default class TextInput extends AbstractFormInput {

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

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "readonly", "autocomplete"];
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

}

FormElementRegistry.register("TextInput", TextInput);
customElements.define("emc-field-input-text", TextInput);
