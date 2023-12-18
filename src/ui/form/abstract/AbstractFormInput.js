import AbstractFormField from "./AbstractFormField.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import {
    isEqual
} from "../../../util/helper/Comparator.js";
import "../button/Button.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "../abstract/AbstractFormInput.js.html" assert {type: "html"};
import STYLE from "../abstract/AbstractFormInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./AbstractFormInput.js.json" assert {type: "json"};

// https://web.dev/more-capable-form-controls/#form-associated-custom-elements

function isValueSet(value) {
    if (value == null) {
        return false;
    }
    if (typeof value === "string") {
        return value !== "";
    }
    if (typeof value === "number") {
        return !isNaN(value);
    }
    if (typeof value === "object") {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return Object.keys(value).length > 0;
    }
    return true;
}

export default class AbstractFormInput extends AbstractFormField {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #value;

    #resetEl;

    #validators = new Set();

    #errorList = new Set();

    constructor() {
        if (new.target === AbstractFormInput) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.shadowRoot.getElementById("field-container").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#resetEl = this.shadowRoot.getElementById("reset");
        this.#resetEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.formResetCallback();
        });
    }

    connectedCallback() {
        this.refreshFormValue();
        this.revalidate();
    }

    formDisabledCallback(disabled) {
        this.#resetEl.disabled = disabled;
    }

    formResetCallback() {
        this.#value = undefined;
        this.refreshFormValue();
        this.revalidate();
        /* --- */
        const event = new Event("default", {bubbles: true, cancelable: true});
        event.value = this.value;
        event.name = this.name;
        event.fieldId = this.id;
        this.dispatchEvent(event);
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    getSubmitValue() {
        return this.value;
    }

    get isChanged() {
        return this.#value !== undefined;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.refreshFormValue();
            this.revalidate();
            if (!this.#errorList.size) {
                const event = new Event("value", {bubbles: true, cancelable: true});
                event.value = value;
                event.name = this.name;
                event.fieldId = this.id;
                this.dispatchEvent(event);
            }
            this.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
        }
    }

    get value() {
        if (this.#value === undefined) {
            return super.value
        }
        return this.#value;
    }

    set resettable(value) {
        this.setBooleanAttribute("resettable", value);
    }

    get resettable() {
        return this.getBooleanAttribute("resettable");
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set required(value) {
        this.setBooleanAttribute("required", value);
    }

    get required() {
        return this.getBooleanAttribute("required");
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "required"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (!this.isChanged) {
                        this.refreshFormValue();
                        this.revalidate();
                    }
                }
            } break;
            case "required": {
                if (oldValue != newValue) {
                    this.revalidate();
                }
            } break;
        }
    }

    async revalidate() {
        const value = this.value;
        this.#errorList.clear();
        const internalMessage = this.checkValid();
        if (typeof internalMessage === "string" && internalMessage !== "") {
            this.#errorList.add(internalMessage);
        }
        const validations = [];
        for (const validator of this.#validators) {
            validations.push(this.#doValidation(validator, value));
        }
        await Promise.all(validations);
        this.#showErrors();
        return [...this.#errorList];
    }

    checkValid() {
        const value = this.value;
        if (this.required && !isValueSet(value)) {
            return "This field is required";
        }
        return "";
    }

    addError(message) {
        if (!this.#errorList.has(message)) {
            this.#errorList.add(message);
            this.#showErrors();
        }
    }

    #showErrors = debounce(() => {
        const message = [...this.#errorList].join("\n");
        this.setCustomValidity(message);
    });

    get errors() {
        return [...this.#errorList];
    }

    addValidator(validator) {
        if (typeof validator === "function" && !this.#validators.has(validator)) {
            this.#validators.add(validator);
            this.revalidate();
        }
    }

    removeValidator(validator) {
        if (typeof validator === "function" && this.#validators.has(validator)) {
            this.#validators.delete(validator);
            this.revalidate();
        }
    }

    async #doValidation(validator, value) {
        const message = await validator(value);
        if (typeof message === "string" && message !== "") {
            this.#errorList.add(message);
        }
    }

    static scalarToValue(value) {
        value.toString();
    }

    static valueToScalar(value) {
        return value.toString();
    }

}
