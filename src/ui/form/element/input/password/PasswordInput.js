import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import "../../../../i18n/builtin/I18nInput.js";
import "../../../../i18n/I18nTooltip.js";
import "./components/ToggleShowButton.js";
import TPL from "./PasswordInput.js.html" assert {type: "html"};
import STYLE from "./PasswordInput.js.css" assert {type: "css"};

export default class PasswordInput extends CustomFormElementDelegating {

    #value;

    #inputEl;

    #showEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", debounce(() => {
            this.value = this.#inputEl.value;
        }, 300));
        /* --- */
        this.#showEl = this.shadowRoot.getElementById("show");
        this.#inputEl.type = this.#showEl.checked ? "text" : "password";
        this.#showEl.addEventListener("change", () => {
            this.#inputEl.type = this.#showEl.checked ? "text" : "password";
        });
    }

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

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#applyValue(value ?? "");
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? super.value;
    }

    set readonly(val) {
        this.setBooleanAttribute("readonly", val);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    static get observedAttributes() {
        return ["value", "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#applyValue(value ?? "");
                    }
                }
            } break;
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
        }
    }

    #applyValue(value) {
        this.#inputEl.value = value ?? this.defaultValue;
    }

}

customElements.define("emc-input-password", PasswordInput);
