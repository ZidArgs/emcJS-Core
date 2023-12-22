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
import "../../../../i18n/I18nTooltip.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./ColorInput.js.html" assert {type: "html"};
import STYLE from "./ColorInput.js.css" assert {type: "css"};

const REGEX_HEX = /^#[0-9a-f]{6}$/;

export default class ColorInput extends CustomFormElementDelegating {

    #value;

    #inputEl;

    #buttonEl;

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
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("input", () => {
            this.#inputEl.value = this.#buttonEl.value;
        });
        this.#buttonEl.addEventListener("change", () => {
            this.value = this.#buttonEl.value;
        });
        this.#buttonEl.addEventListener("click", () => {
            if (this.#inputEl.value === "") {
                this.value = this.#buttonEl.value;
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

    getSubmitValue() {
        const value = this.value;
        if (value == null) {
            return "";
        }
        return value;
    }

    static get observedAttributes() {
        return ["value", "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    safeSetAttribute(this.#buttonEl, "value", newValue);
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
                    safeSetAttribute(this.#buttonEl, "readonly", newValue);
                    if (newValue != null && newValue != "false") {
                        this.#buttonEl.setAttribute("tabindex", -1);
                    } else {
                        this.#buttonEl.setAttribute("tabindex", 0);
                    }
                }
            } break;
        }
    }

    #applyValue(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        if (REGEX_HEX.test(value)) {
            this.#buttonEl.value = value;
        } else {
            this.#buttonEl.value = "#000000";
        }
    }

}

customElements.define("emc-input-color", ColorInput);
