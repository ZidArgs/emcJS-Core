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
import TPL from "./PasswordInput.js.html" assert {type: "html"};
import STYLE from "./PasswordInput.js.css" assert {type: "css"};

// TODO add required [lowercase,uppercase,digit,{symbol_declaration}]
export default class PasswordInput extends AbstractFormElement {

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
        const tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#buttonEl.addEventListener("change", (event) => {
            const showValue = this.#buttonEl.checked;
            tooltipEl.i18nTooltip = showValue ? "Input shown" : "Input hidden";
            this.#inputEl.type = showValue ? "text" : "password";
            event.stopPropagation();
        });
        this.#inputEl.type = this.#buttonEl.checked ? "text" : "password";
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
        if (disabled) {
            this.#buttonEl.checked = false;
        }
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#inputEl.value = value;
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
            case "minlength":
            case "maxlength": {
                if (oldValue != newValue) {
                    this.revalidate();
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value ?? "";
        const min = this.minLength;
        if (min != null && value.length < min) {
            return `The minimum length for this field is {{0::${min}}} characters`;
        }
        const max = this.maxLength;
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
