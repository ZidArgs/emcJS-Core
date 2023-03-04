import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    saveSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/builtin/I18nOption.js";
import TPL from "./SimpleSelect.js.html" assert {type: "html"};
import STYLE from "./SimpleSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SimpleSelect.js.form-config.json" assert {type: "json"};

export default class SimpleSelect extends AbstractFormInput {

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
            this.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
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
        this.#inputEl.value = this.value;
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

    static fromConfig(config) {
        const selectEl = new SimpleSelect();
        const {options = {}, ...params} = config;
        for (const name in params) {
            const value = params[name];
            if (value != null) {
                selectEl.setAttribute(name, value);
            }
        }
        const inputEl = selectEl.shadowRoot.getElementById("input");
        for (const value in options) {
            const optionEl = document.createElement("option", {is: "emc-i18n-option"});
            optionEl.setAttribute("value", value);
            const label = options[value];
            if (typeof label === "string" && label !== "") {
                optionEl.i18nValue = label;
            } else if (value !== "") {
                optionEl.i18nValue = value;
            }
            inputEl.append(optionEl);
        }
        return selectEl;
    }

}

FormElementRegistry.register("SimpleSelect", SimpleSelect);
customElements.define("emc-field-select-simple", SimpleSelect);
