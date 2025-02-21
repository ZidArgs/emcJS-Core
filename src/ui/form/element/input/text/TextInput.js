import AbstractFormElement from "../../AbstractFormElement.js";
import {
    deepClone
} from "../../../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/builtin/I18nTextarea.js";
import TPL from "./TextInput.js.html" assert {type: "html"};
import STYLE from "./TextInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./TextInput.js.json" assert {type: "json"};

export default class TextInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #fieldEl;

    #inputEl;

    #expandButtonEl;

    #lengthInfoEl;

    constructor() {
        super();
        this.#fieldEl = this.shadowRoot.getElementById("field");
        this.#fieldEl.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#expandButtonEl = this.shadowRoot.getElementById("expand-button");
        this.#lengthInfoEl = this.shadowRoot.getElementById("length-info");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.value = this.#inputEl.value;
            this.#printLengthToMax();
        });
        this.#inputEl.addEventListener("keydown", (event) => {
            if (event.keyCode === 13 && event.shiftKey === this.sendOnShift) {
                event.stopPropagation();
                return false;
            }
        });
        /* --- */
        this.#expandButtonEl.addEventListener("click", () => {
            if (this.#fieldEl.classList.contains("expanded")) {
                this.#fieldEl.classList.remove("expanded");
                this.#expandButtonEl.innerText = "⛶";
            } else {
                this.#fieldEl.classList.add("expanded");
                this.#expandButtonEl.innerText = "🗙";
            }
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
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

    set sendOnShift(value) {
        this.setBooleanAttribute("sendonshift", value);
    }

    get sendOnShift() {
        return this.getBooleanAttribute("sendonshift");
    }

    set spellcheck(value) {
        this.setBooleanAttribute("spellcheck", value);
    }

    get spellcheck() {
        return this.getBooleanAttribute("spellcheck");
    }

    set stretch(value) {
        this.setBooleanAttribute("stretch", value);
    }

    get stretch() {
        return this.getBooleanAttribute("stretch");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "placeholder", "readonly", "minlength", "maxlength", "spellcheck"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", this.readonly);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    this.#inputEl.i18nPlaceholder = this.placeholder;
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
            case "spellcheck": {
                if (oldValue != newValue) {
                    this.#inputEl.spellcheck = this.spellcheck;
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

FormElementRegistry.register("TextInput", TextInput);
customElements.define("emc-input-text", TextInput);
registerFocusable("emc-input-text");
