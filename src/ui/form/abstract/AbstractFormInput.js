import AbstractFormField from "./AbstractFormField.js";
import "../button/internal/InputResetButton.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "../abstract/AbstractFormInput.js.html" assert {type: "html"};
import STYLE from "../abstract/AbstractFormInput.js.css" assert {type: "css"};

// https://web.dev/more-capable-form-controls/#form-associated-custom-elements

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
            this.fieldResetCallback();
            /* --- */
            const resetEvent = new Event("reset", {bubbles: true, cancelable: true});
            resetEvent.name = this.name;
            resetEvent.ref = this.ref;
            resetEvent.fieldId = this.id;
            this.dispatchEvent(resetEvent);
        });
    }

    connectedCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formDisabledCallback(disabled) {
        this.#resetEl.disabled = disabled;
    }

    fieldResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set ref(value) {
        this.setAttribute("ref", value);
    }

    get ref() {
        return this.getAttribute("ref");
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
                event.ref = this.ref;
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
        return [...super.observedAttributes, "required"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
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
            event.ref = this.ref;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        }
    }

    // TODO revalidate with custom validation callback
    revalidate() {
        if (this.required && this.value === "") {
            return "This field is required";
        }
        return "";
    }

}
