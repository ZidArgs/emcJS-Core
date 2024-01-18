import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/I18nTooltip.js";
import "../../element/input/password/PasswordInput.js";
import TPL from "./PasswordInput.js.html" assert {type: "html"};
import STYLE from "./PasswordInput.js.css" assert {type: "css"};

export default class PasswordInput extends AbstractFormInput {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            const value = this.#inputEl.value;
            this.value = value;
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
        const value = this.value;
        this.#inputEl.value = value;
    }

    validityCallback(message) {
        this.#inputEl.setCustomValidity(message);
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "readonly"];
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
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", newValue);
                }
            } break;
        }
    }

}

FormElementRegistry.register("PasswordInput", PasswordInput);
customElements.define("emc-field-input-password", PasswordInput);
