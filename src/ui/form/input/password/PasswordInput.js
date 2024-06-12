import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    registerFocusable
} from "../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/I18nTooltip.js";
import "./components/ToggleShowButton.js";
import TPL from "./PasswordInput.js.html" assert {type: "html"};
import STYLE from "./PasswordInput.js.css" assert {type: "css"};

// TODO add required [lowercase,uppercase,digit,{symbol_declaration}]
export default class PasswordInput extends AbstractFormElement {

    #inputEl;

    #showEl;

    #minLength;

    #maxLength;

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
        this.#showEl = this.shadowRoot.getElementById("show");
        this.#inputEl.type = this.#showEl.checked ? "text" : "password";
        this.#showEl.addEventListener("change", () => {
            this.#inputEl.type = this.#showEl.checked ? "text" : "password";
        });
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    connectedCallback() {
        super.connectedCallback();
        this.#inputEl.value = this.value;
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#showEl.disabled = disabled;
        this.#showEl.checked = false;
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#inputEl.value = value;
    }

    validityCallback(message) {
        if (message == "") {
            this.#showEl.classList.remove("invalid");
        } else {
            this.#showEl.classList.add("invalid");
        }
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    set maxLength(value) {
        this.setIntAttribute("maxlength", value, 0);
    }

    get maxLength() {
        return this.getIntAttribute("maxlength");
    }

    set minLength(value) {
        this.setIntAttribute("minlength", value, 0);
    }

    get minLength() {
        return this.getIntAttribute("minlength");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "placeholder", "readonly", "minlength", "maxlength"];
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
                }
            } break;
            case "minlength": {
                if (oldValue != newValue) {
                    this.#minLength = parseInt(newValue) || null;
                    this.revalidate();
                }
            } break;
            case "maxlength": {
                if (oldValue != newValue) {
                    this.#maxLength = parseInt(newValue) || null;
                    this.revalidate();
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value ?? "";
        const min = this.#minLength;
        if (min != null && value.length < min) {
            return `The minimum length for this field is {{0::${min}}} characters`;
        }
        const max = this.#maxLength;
        if (max != null && value.length > max) {
            return `The maximum length for this field is {{0::${max}}} characters`;
        }
        return super.checkValid();
    }

    applyValueAttribute(value) {
        safeSetAttribute(this.#inputEl, "value", value ?? "");
    }

    renderValue(value) {
        this.#inputEl.value = value ?? "";
    }

}

FormElementRegistry.register("PasswordInput", PasswordInput);
customElements.define("emc-input-password", PasswordInput);
registerFocusable("emc-input-password");
