import AbstractFormElement from "../AbstractFormElement.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "./AbstractFormInput.js.html" assert {type: "html"};
import STYLE from "./AbstractFormInput.js.css" assert {type: "css"};

// https://web.dev/more-capable-form-controls/#form-associated-custom-elements

/*
TODO prevent default invalid handling
document.addEventListener('invalid', (function(){
    return function(e) {
      //prevent the browser from showing default error bubble / hint
      e.preventDefault();
      // optionally fire off some custom validation handler
      // myValidation();
    };
})(), true);
*/

export default class AbstractFormInput extends AbstractFormElement {

    #resetEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#resetEl = this.shadowRoot.getElementById("reset");
        this.#resetEl.addEventListener("click", () => {
            const event = new Event("value-reset", {bubbles: true, cancelable: true});
            event.key = this.key;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.value = this.getAttribute("value") || "";
    }

    formDisabledCallback(disabled) {
        this.#resetEl.disabled = disabled;
    }

    formResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        this.internals.setFormValue(value);
        const message = this.revalidate();
        if (typeof message === "string" && message !== "") {
            this.setCustomValidity(message);
        } else {
            this.setCustomValidity("");
            const event = new Event("value-change", {bubbles: true, cancelable: true});
            event.value = value;
            event.valid = this.checkValidity();
            event.error = this.validationMessage;
            event.name = this.name;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        }
        this.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
    }

    get value() {
        return super.value;
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

    set disabled(value) {
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
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

    setCustomValidity(message) {
        if (typeof message === "string" && message !== "") {
            this.internals.setValidity({customError: true}, message);
        } else {
            this.internals.setValidity({}, "");
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
