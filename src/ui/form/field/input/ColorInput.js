import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import "../../../i18n/I18nTooltip.js";
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
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("change", () => {
            this.#inputEl.value = this.#buttonEl.value;
            super.value = this.#buttonEl.value;
        });
        this.#buttonEl.addEventListener("click", () => {
            if (this.#inputEl.value === "") {
                this.#inputEl.value = this.#buttonEl.value;
                super.value = this.#buttonEl.value;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#inputEl.value = value;
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

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#inputEl.value = value;
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        const value = this.#inputEl.value;
        this.value = value;
    }, 300);

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "readonly", "autocomplete"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("value", newValue);
                    this.#buttonEl.setAttribute("value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                        if (REGEX_HEX.test(value)) {
                            this.#buttonEl.value = value;
                        } else {
                            this.#buttonEl.value = "#000000";
                        }
                    }
                }
            } break;
            case "autocomplete": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("autocomplete", newValue);
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
                    this.#buttonEl.setAttribute("readonly", newValue);
                    if (newValue != null && newValue != "false") {
                        this.#buttonEl.setAttribute("tabindex", -1);
                    } else {
                        this.#buttonEl.setAttribute("tabindex", 0);
                    }
                }
            } break;
        }
    }

    setCustomValidity(message) {
        super.setCustomValidity(message, this.#inputEl);
    }

    revalidate() {
        const value = this.value;
        if (value !== "" && !REGEX_HEX.test(value)) {
            return "Please enter a valid hexadecimal color (#000000 - #FFFFFF)";
        }
        return super.revalidate();
    }

}

FormElementRegistry.register("ColorInput", ColorInput);
customElements.define("emc-field-input-color", ColorInput);
