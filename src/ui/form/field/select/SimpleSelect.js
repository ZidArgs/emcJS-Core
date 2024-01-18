import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import OptionGroupRegistry from "../../../../data/registry/form/OptionGroupRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import I18nOption from "../../../i18n/builtin/I18nOption.js";
import TPL from "./SimpleSelect.js.html" assert {type: "html"};
import STYLE from "./SimpleSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SimpleSelect.js.json" assert {type: "json"};

// TODO create custom simple select

export default class SimpleSelect extends AbstractFormInput {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #inputEl;

    #optionGroup = null;

    #optionGroupEventTargetManager = new EventTargetManager();

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
        /* --- */
        this.#optionGroupEventTargetManager.set("change", () => {
            this.#loadOptionsFromGroup();
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

    set optiongroup(value) {
        this.setAttribute("optiongroup", value);
    }

    get optiongroup() {
        return this.getAttribute("optiongroup");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "readonly", "optiongroup"];
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
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
            case "optiongroup": {
                if (oldValue != newValue) {
                    if (newValue == null || newValue === "") {
                        this.#optionGroup = null;
                    } else {
                        this.#optionGroup = new OptionGroupRegistry(newValue);
                    }
                    this.#optionGroupEventTargetManager.switchTarget(this.#optionGroup);
                    this.#loadOptionsFromGroup();
                }
            } break;
        }
    }

    static fromConfig(config) {
        const selectEl = new SimpleSelect();
        const {options = {}, optiongroup, ...params} = config;
        for (const name in params) {
            const value = params[name];
            safeSetAttribute(selectEl, name, value);
        }
        if (typeof optiongroup === "string" && optiongroup !== "") {
            selectEl.setAttribute("optiongroup", optiongroup);
        } else {
            const inputEl = selectEl.shadowRoot.getElementById("input");
            for (const value in options) {
                const optionEl = I18nOption.create();
                optionEl.setAttribute("value", value);
                const label = options[value];
                if (typeof label === "string" && label !== "") {
                    optionEl.i18nValue = label;
                } else if (value !== "") {
                    optionEl.i18nValue = value;
                }
                inputEl.append(optionEl);
            }
        }
        return selectEl;
    }

    #loadOptionsFromGroup() {
        this.#inputEl.innerHTML = "";
        if (this.#optionGroup != null) {
            for (const [value, label] of this.#optionGroup) {
                const optionEl = I18nOption.create();
                optionEl.setAttribute("value", value);
                if (typeof label === "string" && label !== "") {
                    optionEl.i18nValue = label;
                } else if (value !== "") {
                    optionEl.i18nValue = value;
                }
                this.#inputEl.append(optionEl);
            }
        }
    }

}

FormElementRegistry.register("SimpleSelect", SimpleSelect);
customElements.define("emc-field-select-simple", SimpleSelect);
