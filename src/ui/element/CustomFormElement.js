import CustomElement from "./CustomElement.js";

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

export default class CustomFormElement extends CustomElement {

    static get formAssociated() {
        return true;
    }

    #internals;

    constructor() {
        if (new.target === CustomFormElement) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.#internals = this.attachInternals();
    }

    get internals() {
        return this.#internals;
    }

    focus(options) {
        const firstFocusEl = this.shadowRoot.querySelector(Q_TAB);
        if (firstFocusEl != null) {
            firstFocusEl.focus(options);
        }
    }

    formAssociatedCallback(/* form */) {
        // ignore
    }

    formDisabledCallback(/* disabled */) {
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

}
