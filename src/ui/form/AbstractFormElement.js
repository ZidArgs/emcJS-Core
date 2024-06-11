import CustomFormElement from "../element/CustomFormElement.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import {
    debounce
} from "../../util/Debouncer.js";
import {
    isEqual
} from "../../util/helper/Comparator.js";
import "./button/Button.js";
import TPL from "./AbstractFormElement.js.html" assert {type: "html"};
import STYLE from "./AbstractFormElement.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./AbstractFormElement.js.json" assert {type: "json"};

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

export default class AbstractFormElement extends CustomFormElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #value;

    #tooltipEl;

    #labelTextEl;

    #resetEl;

    #validators = new Set();

    #errorList = new Set();

    constructor() {
        if (new.target === AbstractFormElement) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#labelTextEl = this.shadowRoot.getElementById("label-text");
        this.#resetEl = this.shadowRoot.getElementById("reset");
        this.#resetEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.formResetCallback();
        });
    }

    connectedCallback() {
        this.renderValue(this.value);
        this.refreshFormValue();
        this.revalidate();
    }

    formDisabledCallback(disabled) {
        this.#resetEl.disabled = disabled;
    }

    formResetCallback() {
        this.#value = undefined;
        this.renderValue(this.value);
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

    /** @deprecated */
    get isChanged() {
        return this.#value !== undefined;
    }

    get isDefault() {
        return this.#value === undefined;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.renderValue(value);
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
            return super.value;
        }
        return this.#value;
    }

    get rawValue() {
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

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get label() {
        return this.getAttribute("label");
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "required", "label", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.applyValueAttribute(newValue);
                    if (this.isDefault) {
                        this.renderValue(this.value);
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
            case "label": {
                if (oldValue != newValue) {
                    this.#labelTextEl.i18nValue = newValue;
                }
            } break;
            case "tooltip": {
                if (oldValue != newValue) {
                    this.#tooltipEl.i18nTooltip = newValue;
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

    formContextAssociatedCallback(/* formContext */) {
        // ignore
    }

    applyValueAttribute(/* value */) {
        // ignore
    }

    renderValue(/* value */) {
        // ignore
    }

}
