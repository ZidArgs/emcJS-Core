import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../element/input/KeyValueListInput.js";
import TPL from "./KeyValueListInput.js.html" assert {type: "html"};
import STYLE from "./KeyValueListInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./KeyValueListInput.js.json" assert {type: "json"};

export default class KeyValueListInput extends AbstractFormInput {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.value;
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.#inputEl.value = this.value;
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        const resolvedValue = this.value;
        if (typeof resolvedValue !== "object") {
            this.#inputEl.value = null;
        } else {
            this.#inputEl.value = resolvedValue;
        }
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? {};
    }

    set value(value) {
        if (typeof value === "string") {
            value = JSON.parse(value);
        }
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    getSubmitValue() {
        return this.#inputEl.getSubmitValue();
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        if (typeof value === "object") {
                            this.#inputEl.value = value;
                        } else {
                            try {
                                const resolvedValue = JSON.parse(value);
                                if (typeof resolvedValue !== "object") {
                                    this.#inputEl.value = null;
                                } else {
                                    this.#inputEl.value = resolvedValue;
                                }
                            } catch {
                                this.#inputEl.value = null;
                            }
                        }
                    }
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

}

FormElementRegistry.register("KeyValueListInput", KeyValueListInput);
customElements.define("emc-field-input-key-value-list", KeyValueListInput);
