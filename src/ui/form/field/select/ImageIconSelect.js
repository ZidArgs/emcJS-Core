import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import OptionGroupRegistry from "../../../../data/registry/OptionGroupRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    safeSetAttribute
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

    #optionGroup = null;

    #optionGroupEventTargetManager = new EventTargetManager();

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.value
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
        const selectEl = new ImageIconSelect();
        const {options = {}, optiongroup, ...params} = config;
        for (const name in params) {
            const value = params[name];
            safeSetAttribute(selectEl, name, value);
        }
        if (typeof optiongroup === "string" && optiongroup !== "") {
            selectEl.setAttribute("optiongroup", optiongroup);
        } else {
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
        }
        return selectEl;
    }

    #loadOptionsFromGroup() {
        this.innerHTML = "";
        if (this.#optionGroup != null) {
            for (const [value, label] of this.#optionGroup) {
                const optionEl = document.createElement("option");
                optionEl.setAttribute("value", value);
                if (typeof label === "string" && label !== "") {
                    optionEl.innerHTML = label;
                } else if (value !== "") {
                    optionEl.innerHTML = value;
                }
                this.append(optionEl);
            }
        }
    }

}

FormElementRegistry.register("ImageIconSelect", ImageIconSelect);
customElements.define("emc-field-select-icon-image", ImageIconSelect);
