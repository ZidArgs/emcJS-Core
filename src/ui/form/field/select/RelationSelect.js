import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import "../../element/select/relation/RelationSelect.js";
import TPL from "./RelationSelect.js.html" assert {type: "html"};
import STYLE from "./RelationSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./RelationSelect.js.json" assert {type: "json"};

export default class RelationSelect extends AbstractFormInput {

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

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    set types(value) {
        this.setJSONAttribute("types", value);
    }

    get types() {
        return this.getJSONAttribute("types");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "readonly", "autocomplete", "sorted", "types"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        this.#inputEl.value = value;
                    }
                }
            } break;
            case "readonly":
            case "autocomplete":
            case "placeholder":
            case "sorted":
            case "types": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

    static fromConfig(config) {
        const selectEl = new RelationSelect();
        const {types, ...params} = config;
        for (const name in params) {
            const value = params[name];
            safeSetAttribute(selectEl, name, value);
        }
        if (Array.isArray(types)) {
            selectEl.types = types;
        }
        return selectEl;
    }

}

FormElementRegistry.register("RelationSelect", RelationSelect);
customElements.define("emc-field-select-relation", RelationSelect);
