import AbstractFormInput from "./AbstractFormInput.js";
import "./components/InputResetButton.js";
import "./components/ToggleShowButton.js";
import "../../i18n/I18nInput.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import FormElementRegistry from "../../../data/registry/FormElementRegistry.js";
import "../../i18n/I18nTooltip.js";
import TPL from "./ColorInput.js.html" assert {type: "html"};
import STYLE from "./ColorInput.js.css" assert {type: "css"};

const REGEX_HEX = /^#[0-9a-f]{6}$/;

export default class ColorInput extends AbstractFormInput {

    #inputEl;

    #buttonEl;

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
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("change", () => {
            this.#inputEl.value = this.#buttonEl.value;
            super.value = this.#buttonEl.value;
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.getAttribute("value");
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
    }

    fieldResetCallback() {
        super.fieldResetCallback();
        const value = this.getAttribute("value");
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.getAttribute("value");
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
    }

    focus(options) {
        if (this.#inputEl != null) {
            this.#inputEl.focus(options);
        }
    }

    #onInput = debounce(() => {
        const value = this.#inputEl.value;
        super.value = value;
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
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
                    this.#buttonEl.setAttribute("value", newValue);
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

    revalidate() {
        const value = this.value;
        if (value !== "" && !REGEX_HEX.test(value)) {
            return "Please enter a valid hexadecimal color (#000000 - #FFFFFF)";
        }
        return super.revalidate();
    }

}

FormElementRegistry.register("color", ColorInput);
customElements.define("emc-input-color", ColorInput);
