import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/I18nTooltip.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./ColorInput.js.html" assert {type: "html"};
import STYLE from "./ColorInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ColorInput.js.json" assert {type: "json"};

const REGEX_HEX = /^#[0-9a-f]{6}$/;

export default class ColorInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #inputEl;

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.value = this.#inputEl.value;
        });
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("input", () => {
            this.#inputEl.value = this.#buttonEl.value;
        });
        this.#buttonEl.addEventListener("change", () => {
            this.value = this.#buttonEl.value;
        });
        this.#buttonEl.addEventListener("click", () => {
            this.value = this.#buttonEl.value;
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
    }

    focus(options) {
        super.focus(options);
        this.#buttonEl.focus(options);
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", newValue);
                    safeSetAttribute(this.#buttonEl, "readonly", newValue);
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value;
        if (value != null && value !== "" && !REGEX_HEX.test(value)) {
            return "Please enter a valid hexadecimal color (#000000 - #FFFFFF)";
        }
        return super.checkValid();
    }

    renderValue(value) {
        this.#inputEl.value = value ?? "";
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "";
        }
    }

}

FormElementRegistry.register("ColorInput", ColorInput);
customElements.define("emc-input-color", ColorInput);
registerFocusable("emc-input-color");
