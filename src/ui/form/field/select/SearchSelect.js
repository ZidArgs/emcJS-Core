import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    saveSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../../i18n/builtin/I18nOption.js";
import "../../element/select/SearchSelect.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SearchSelect.js.form-config.json" assert {type: "json"};

export default class SearchSelect extends AbstractFormInput {

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
            this.value = this.#inputEl.value
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
        return [...super.observedAttributes, "value", "placeholder", "readonly", "autocomplete", "sorted"];
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
            case "readonly":
            case "autocomplete":
            case "placeholder":
            case "sorted": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

    static fromConfig(config) {
        const selectEl = new SearchSelect();
        const {options = {}, ...params} = config;
        for (const name in params) {
            const value = params[name];
            if (value != null) {
                selectEl.setAttribute(name, value);
            }
        }
        for (const value in options) {
            const optionEl = document.createElement("option", {is: "emc-i18n-option"});
            optionEl.setAttribute("value", value);
            const label = options[value];
            if (typeof label === "string" && label !== "") {
                optionEl.i18nValue = label;
            } else if (value !== "") {
                optionEl.i18nValue = value;
            }
            selectEl.append(optionEl);
        }
        return selectEl;
    }

}

FormElementRegistry.register("SearchSelect", SearchSelect);
customElements.define("emc-field-select-search", SearchSelect);
