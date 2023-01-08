import CustomElementDelegating from "../element/CustomElementDelegating.js";

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

export default class AbstractFormElement extends CustomElementDelegating {

    #internals;

    constructor() {
        super();
        this.#internals = this.attachInternals();
    }

    static get formAssociated() {
        return true;
    }

    get internals() {
        return this.#internals;
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    focus() {
        const firstFocusEl = this.shadowRoot.querySelector(Q_TAB);
        if (firstFocusEl != null) {
            firstFocusEl.focus();
        }
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

    // TODO
    get validity() {
        return this.#internals.validity;
    }

    // TODO
    get validationMessage() {
        return this.#internals.validationMessage;
    }

    // TODO
    get willValidate() {
        return this.#internals.willValidate;
    }

    // TODO
    checkValidity() {
        return this.#internals.checkValidity();
    }

    // TODO
    reportValidity() {
        return this.#internals.reportValidity();
    }

}
