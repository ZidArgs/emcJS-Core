import AbstractFormInput from "../AbstractFormInput.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import "../../../../i18n/I18nLabel.js";
import "../../../../i18n/I18nTooltip.js";
import TPL from "./ActionInput.js.html" assert {type: "html"};
import STYLE from "./ActionInput.js.css" assert {type: "css"};

export default class ActionInput extends AbstractFormInput {

    #value;

    #textEl;

    #buttonEl;

    #valueRenderer = null;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            const event = new Event("action");
            event.value = this.value;
            this.dispatchEvent(event);
        });
    }

    connectedCallback() {
        const value = this.value;
        this.#value = value;
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = super.value || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#renderValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? super.value;
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

    static get observedAttributes() {
        return ["name", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value === undefined) {
                        this.#renderValue(this.value);
                        this.internals.setFormValue(this.value);
                        /* --- */
                        this.dispatchEvent(new Event("change"));
                    }
                }
            } break;
        }
    }

    #renderValue(value) {
        if (this.#valueRenderer != null) {
            this.#valueRenderer(value);
        } else {
            this.#textEl.i18nValue = value;
        }
    }

    setValueRenderer(renderer) {
        if (typeof renderer === "function") {
            this.#valueRenderer = renderer;
        } else {
            this.#valueRenderer = null;
        }
    }

}

customElements.define("emc-input-action", ActionInput);
