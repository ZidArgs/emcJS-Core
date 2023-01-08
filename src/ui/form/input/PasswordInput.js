import AbstractFormInput from "./AbstractFormInput.js";
import "./components/InputResetButton.js";
import "./components/ToggleShowButton.js";
import "../../i18n/I18nInput.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import FormElementRegistry from "../../../data/registry/FormElementRegistry.js";
import "../../i18n/I18nTooltip.js";
import TPL from "./PasswordInput.js.html" assert {type: "html"};
import STYLE from "./PasswordInput.js.css" assert {type: "css"};

export default class PasswordInput extends AbstractFormInput {

    #inputEl;

    #showEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#onInput();
        });
        this.#inputEl.addEventListener("change", (event) => {
            this.dispatchEvent(new Event("change", event));
        });
        /* --- */
        this.#showEl = this.shadowRoot.getElementById("show");
        this.#inputEl.type = this.#showEl.checked ? "text" : "password";
        this.#showEl.addEventListener("input", () => {
            this.#inputEl.type = this.#showEl.checked ? "text" : "password";
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#showEl.disabled = disabled;
        this.#showEl.checked = false;
    }

    focus(options) {
        if (this.#inputEl != null) {
            this.#inputEl.focus(options);
        }
    }

    #onInput = debounce(() => {
        super.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        this.#inputEl.value = value;
        super.value = value;
    }

    get value() {
        return this.#inputEl.value;
    }

    static get observedAttributes() {
        return ["value", "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("value", newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("readonly", newValue);
                }
            } break;
        }
    }

    setCustomValidity(message) {
        if (typeof message === "string" && message !== "") {
            this.internals.setValidity({customError: true}, message, this.#inputEl);
        } else {
            this.internals.setValidity({}, "");
        }
    }

}

FormElementRegistry.register("password", PasswordInput);
customElements.define("emc-input-password", PasswordInput);
