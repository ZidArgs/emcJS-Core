import AbstractFormElement from "../../AbstractFormElement.js";
import "../../../i18n/builtin/I18nTextarea.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../../util/helper/html/getFocusableElements.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./TextInput.js.html" assert {type: "html"};
import STYLE from "./TextInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./TextInput.js.json" assert {type: "json"};

// TODO add indicator for max length
export default class TextInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #inputEl;

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
        this.#inputEl.addEventListener("keydown", (event) => {
            if (event.keyCode === 13 && event.shiftKey === this.sendOnShift) {
                event.stopPropagation();
                return false;
            }
        });
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
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

    set sendOnShift(value) {
        this.setBooleanAttribute("sendonshift", value);
    }

    get sendOnShift() {
        return this.getBooleanAttribute("sendonshift");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "placeholder", "readonly", "autocomplete", "minlength", "maxlength"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly":
            case "autocomplete": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
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

FormElementRegistry.register("TextInput", TextInput);
customElements.define("emc-input-text", TextInput);
registerFocusable("emc-input-text");
