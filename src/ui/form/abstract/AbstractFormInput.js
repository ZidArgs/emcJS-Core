import AbstractFormField from "./AbstractFormField.js";
import "../button/internal/InputResetButton.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "../abstract/AbstractFormInput.js.html" assert {type: "html"};
import STYLE from "../abstract/AbstractFormInput.js.css" assert {type: "css"};

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

    #value;

    #resetEl;

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
        this.internals.setFormValue(this.value);
    }

    formDisabledCallback(disabled) {
        this.#resetEl.disabled = disabled;
    }

    formResetCallback() {
        this.#value = null;
        this.internals.setFormValue(this.value);
        const message = this.revalidate();
        if (typeof message === "string" && message !== "") {
            this.setCustomValidity(message);
        } else {
            this.setCustomValidity("");
        }
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

    get defaultValue() {
        return super.defaultValue ?? "";
    }

    get isChanged() {
        return this.#value != null;
    }

    set value(value) {
        if (this.#value != value) {
            this.#value = value;
            this.internals.setFormValue(value);
            const message = this.revalidate();
            if (typeof message === "string" && message !== "") {
                this.setCustomValidity(message);
            } else {
                this.setCustomValidity("");
                /* --- */
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
        return this.#value ?? super.value;
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
                        this.internals.setFormValue(this.value);
                        const message = this.revalidate();
                        if (typeof message === "string" && message !== "") {
                            this.setCustomValidity(message);
                        } else {
                            this.setCustomValidity("");
                        }
                    }
                }
            } break;
            case "required": {
                if (oldValue != newValue) {
                    const message = this.revalidate();
                    this.setCustomValidity(message);
                }
            } break;
        }
    }

    setCustomValidity(message, target) {
        if (typeof message !== "string") {
            message = "";
        }
        if (this.validationMessage != message) {
            this.internals.setValidity({customError: message !== ""}, message, target);
            if ("setCustomValidity" in target) {
                target.setCustomValidity(message);
            }
            /* --- */
            const event = new Event("validity", {bubbles: true, cancelable: true});
            event.value = this.value;
            event.valid = message === "";
            event.error = message;
            event.name = this.name;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        }
    }

    // TODO revalidate with custom validation callback
    revalidate() {
        const value = this.value;
        if (this.required && !isValueSet(value)) {
            return "This field is required";
        }
        return "";
    }

    static scalarToValue(value) {
        value.toString();
    }

    static valueToScalar(value) {
        return value.toString();
    }

}
