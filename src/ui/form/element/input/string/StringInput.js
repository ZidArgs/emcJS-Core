import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import {
    deepClone
} from "../../../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./StringInput.js.html" assert {type: "html"};
import STYLE from "./StringInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./StringInput.js.json" assert {type: "json"};

// TODO add indicator for max length
// TODO add pattern (expected pattern as regexp) - validation
export default class StringInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #inputEl;

    #lengthInfoEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#lengthInfoEl = this.shadowRoot.getElementById("length-info");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#onInput();
            this.#printLengthToMax();
        });
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        this.#inputEl.value = this.value;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    set minLength(value) {
        this.setIntAttribute("minlength", value, 0);
    }

    get minLength() {
        return this.getIntAttribute("minlength");
    }

    set maxLength(value) {
        this.setIntAttribute("maxlength", value, 0);
    }

    get maxLength() {
        return this.getIntAttribute("maxlength");
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
                    if (this.minLength > -1) {
                        this.revalidate();
                    } else {
                        this.minLength = null;
                    }
                }
            } break;
            case "maxlength": {
                if (oldValue != newValue) {
                    if (this.maxLength > -1) {
                        this.revalidate();
                        this.#printLengthToMax();
                    } else {
                        this.maxLength = null;
                    }
                }
            } break;
        }
    }

    checkValid() {
        const value = this.value;
        if (value != null && value !== "") {
            const min = this.minLength;
            if (min != null && value.length < min) {
                return `The minimum length for this field is {{0::${min}}} characters`;
            }
            const max = this.maxLength;
            if (max != null && value.length > max) {
                return `The maximum length for this field is {{0::${max}}} characters`;
            }
        }
        return super.checkValid();
    }

    renderValue(value) {
        this.#inputEl.value = value ?? "";
        this.#printLengthToMax();
    }

    #printLengthToMax() {
        if (this.maxLength != null) {
            const value = this.#inputEl.value ?? "";
            const length = value.length;
            this.#lengthInfoEl.innerText = `${length} / ${this.maxLength}`;
        }
    }

}

FormElementRegistry.register("StringInput", StringInput);
customElements.define("emc-input-string", StringInput);
registerFocusable("emc-input-string");
