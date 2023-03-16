import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    saveSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../element/icon/ImageIconSelect.js";
import TPL from "./ImageIconSelect.js.html" assert {type: "html"};
import STYLE from "./ImageIconSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ImageIconSelect.js.form-config.json" assert {type: "json"};

export default class ImageIconSelect extends AbstractFormInput {

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

    validityCallback(message) {
        this.#inputEl.setCustomValidity(message);
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

    set root(value) {
        this.setAttribute("root", value);
    }

    get root() {
        return this.getAttribute("root");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "readonly", "root"];
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
            case "root": {
                if (oldValue != newValue) {
                    saveSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

    static fromConfig(config) {
        const selectEl = new ImageIconSelect();
        const {options = {}, ...params} = config;
        for (const name in params) {
            const value = params[name];
            if (value != null) {
                selectEl.setAttribute(name, value);
            }
        }
        for (const value in options) {
            const optionEl = document.createElement("option");
            optionEl.setAttribute("value", value);
            const label = options[value];
            if (typeof label === "string" && label !== "") {
                optionEl.innerHTML = label;
            } else if (value !== "") {
                optionEl.innerHTML = value;
            }
            selectEl.append(optionEl);
        }
        return selectEl;
    }

}

FormElementRegistry.register("ImageIconSelect", ImageIconSelect);
customElements.define("emc-field-select-icon-image", ImageIconSelect);
