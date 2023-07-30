import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import I18nOption from "../../../i18n/builtin/I18nOption.js";
import "../../element/select/TokenSelect.js";
import TPL from "./TokenSelect.js.html" assert {type: "html"};
import STYLE from "./TokenSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./TokenSelect.js.json" assert {type: "json"};

export default class TokenSelect extends AbstractFormInput {

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

    getSubmitValue() {
        return this.#inputEl.getSubmitValue();
    }

    set multiple(value) {
        this.setBooleanAttribute("multiple", value);
    }

    get multiple() {
        return this.getBooleanAttribute("multiple");
    }

    set tokengroup(value) {
        this.setAttribute("tokengroup", value);
    }

    get tokengroup() {
        return this.getAttribute("tokengroup");
    }

    set chooseonly(value) {
        this.setBooleanAttribute("chooseonly", value);
    }

    get chooseonly() {
        return this.getBooleanAttribute("chooseonly");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "readonly", "multiple", "tokengroup", "chooseonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.value;
                        if (Array.isArray(value)) {
                            this.#inputEl.value = value;
                        } else {
                            try {
                                const resolvedValue = JSON.parse(value);
                                if (!Array.isArray(resolvedValue)) {
                                    this.#inputEl.value = [resolvedValue];
                                } else {
                                    this.#inputEl.value = resolvedValue;
                                }
                            } catch {
                                this.#inputEl.value = [];
                            }
                        }
                    }
                }
            } break;
            case "readonly":
            case "placeholder":
            case "multiple":
            case "tokengroup":
            case "chooseonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
        }
    }

    static fromConfig(config) {
        const selectEl = new TokenSelect();
        const {options = {}, tokengroup, ...params} = config;
        for (const name in params) {
            const value = params[name];
            safeSetAttribute(selectEl, name, value);
        }
        if (typeof tokengroup === "string" && tokengroup !== "") {
            selectEl.setAttribute("tokengroup", tokengroup);
        } else {
            for (const value in options) {
                const optionEl = I18nOption.create();
                optionEl.setAttribute("value", value);
                const label = options[value];
                if (typeof label === "string" && label !== "") {
                    optionEl.i18nValue = label;
                } else if (value !== "") {
                    optionEl.i18nValue = value;
                }
                selectEl.append(optionEl);
            }
        }
        return selectEl;
    }

}

FormElementRegistry.register("TokenSelect", TokenSelect);
customElements.define("emc-field-select-token", TokenSelect);
