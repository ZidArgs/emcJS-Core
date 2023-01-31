import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import "../../../i18n/I18nLabel.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};

/*
    TODO remove view element - make everything work with just the input
    TODO integrate as form control
*/
export default class SearchSelect extends AbstractFormInput {

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
                    this.#inputEl.setAttribute("value", newValue);
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
                    this.#inputEl.setAttribute(name, newValue);
                }
            } break;
        }
    }

    setCustomValidity(message) {
        super.setCustomValidity(message, this.#inputEl.shadowRoot.getElementById("input"));
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
        for (const name in options) {
            const optionEl = document.createElement("emc-option");
            optionEl.setAttribute("value", name);
            const textValue = options[name];
            if (typeof textValue === "string" && textValue !== "") {
                const labelEl = document.createElement("emc-i18n-label");
                labelEl.i18nValue = textValue;
                optionEl.append(labelEl);
            } else if (name !== "") {
                const labelEl = document.createElement("emc-i18n-label");
                labelEl.i18nValue = name;
                optionEl.append(labelEl);
            }
            selectEl.append(optionEl);
        }
        return selectEl;
    }

}

FormElementRegistry.register("SearchSelect", SearchSelect);
customElements.define("emc-field-select-search", SearchSelect);
