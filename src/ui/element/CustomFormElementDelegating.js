import CustomElementDelegating from "./CustomElementDelegating.js";

export default class CustomFormElementDelegating extends CustomElementDelegating {

    static get formAssociated() {
        return true;
    }

    #internals;

    constructor() {
        if (new.target === CustomFormElementDelegating) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.#internals = this.attachInternals();
    }

    get internals() {
        return this.#internals;
    }

    formAssociatedCallback(/* form */) {
        // ignore
    }

    formDisabledCallback(/* disabled */) {
        // ignore
    }

    validityCallback(/* message */) {
        // ignore
    }

    get form() {
        return this.#internals.form;
    }

    get type() {
        return this.localName;
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set value(value) {
        // ignored
    }

    get value() {
        return this.getAttribute("value");
    }

    set disabled(value) {
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    get validity() {
        return this.internals.validity;
    }

    get validationMessage() {
        return this.internals.validationMessage;
    }

    get willValidate() {
        return this.internals.willValidate;
    }

    checkValidity() {
        return this.internals.checkValidity();
    }

    reportValidity() {
        return this.internals.reportValidity();
    }

    setCustomValidity(message) {
        if (typeof message !== "string") {
            message = "";
        }
        if (this.validationMessage != message) {
            if (message !== "") {
                this.internals.setValidity({customError: true}, message);
                this.validityCallback(message);
            } else {
                this.internals.setValidity({}, "");
                this.validityCallback("");
            }
            const event = new Event("validity", {bubbles: true, cancelable: true});
            event.value = this.value;
            event.valid = message === "";
            event.error = message;
            event.name = this.name;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        }
    }

}
