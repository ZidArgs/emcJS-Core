import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    saveSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../element/logicEditor/LogicEditor.js";
import TPL from "./LogicInput.js.html" assert {type: "html"};
import STYLE from "./LogicInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./LogicInput.js.form-config.json" assert {type: "json"};

export default class LogicInput extends AbstractFormInput {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #value;

    #inputEl;

    #logicEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#logicEl = this.shadowRoot.getElementById("logic");
        this.#inputEl.addEventListener("change", () => {
            const value = this.#inputEl.value;
            if (value === "logic") {
                this.#logicEl.classList.add("active");
                this.value = this.#logicEl.value;
            } else {
                this.#logicEl.classList.remove("active");
                this.#logicEl.value = null;
                this.value = value === "true";
            }
        });
        this.#logicEl.addEventListener("change", () => {
            const value = this.#inputEl.value;
            if (value === "logic") {
                this.value = this.#logicEl.value;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#applyValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#logicEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#applyValue(value);
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    loadOperators(operators) {
        this.#logicEl.loadOperators(operators);
    }

    get defaultValue() {
        return this.getJSONAttribute("value");
    }

    set value(value) {
        if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        }
        if (!isEqual(this.#value, value)) {
            this.#applyValue(value);
            this.#value = value;
            super.value = value;
        }
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                    }
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

    #applyValue(value) {
        if (typeof value === "object") {
            this.#inputEl.value = "logic";
            this.#logicEl.classList.add("active");
            this.#logicEl.value = value;
        } else if (value === false) {
            this.#inputEl.value = "false";
            this.#logicEl.classList.remove("active");
            this.#logicEl.value = null;
        } else {
            this.#inputEl.value = "true";
            this.#logicEl.classList.remove("active");
            this.#logicEl.value = null;
        }
    }

}

FormElementRegistry.register("LogicInput", LogicInput);
customElements.define("emc-field-input-logic", LogicInput);
