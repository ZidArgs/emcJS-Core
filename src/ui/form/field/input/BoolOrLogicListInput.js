import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import I18nOption from "../../../i18n/builtin/I18nOption.js";
import OptionGroupRegistry from "../../../../data/registry/form/OptionGroupRegistry.js";
import "../../element/input/boolorlogiclist/BoolOrLogicListInput.js";
import TPL from "./BoolOrLogicListInput.js.html" assert {type: "html"};
import STYLE from "./BoolOrLogicListInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./BoolOrLogicListInput.js.json" assert {type: "json"};

export default class BoolOrLogicListInput extends AbstractFormInput {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #inputEl;

    #listGroup = null;

    #listGroupEventTargetManager = new EventTargetManager();

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.value;
        });
        this.#inputEl.addEventListener("list", () => {
            this.refreshFormValue();
        });
        /* --- */
        this.#listGroupEventTargetManager.set("change", () => {
            this.#loadListFromGroup();
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

    addOperatorGroup(...groupList) {
        this.#inputEl.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#inputEl.removeOperatorGroup(...groupList);
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? {};
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

    set listgroup(value) {
        this.setAttribute("listgroup", value);
    }

    get listgroup() {
        return this.getAttribute("listgroup");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "readonly", "listgroup"];
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
            case "listgroup": {
                if (oldValue != newValue) {
                    if (newValue == null || newValue === "") {
                        this.#listGroup = null;
                    } else {
                        this.#listGroup = new OptionGroupRegistry(newValue);
                    }
                    this.#listGroupEventTargetManager.switchTarget(this.#listGroup);
                    this.#loadListFromGroup();
                }
            } break;
        }
    }

    static fromConfig(config) {
        const inputEl = new BoolOrLogicListInput();
        const {list = [], listgroup, ...params} = config;
        for (const name in params) {
            const value = params[name];
            safeSetAttribute(inputEl, name, value);
        }
        if (typeof listgroup === "string" && listgroup !== "") {
            inputEl.setAttribute("listgroup", listgroup);
        } else {
            for (const value of list) {
                const optionEl = I18nOption.create();
                optionEl.setAttribute("value", value);
                optionEl.i18nValue = value;
                inputEl.append(optionEl);
            }
        }
        return inputEl;
    }

    #loadListFromGroup() {
        this.innerHTML = "";
        if (this.#listGroup != null) {
            const list = this.#listGroup.keys();
            for (const value of list) {
                const optionEl = I18nOption.create();
                optionEl.setAttribute("value", value);
                optionEl.i18nValue = value;
                this.append(optionEl);
            }
        }
    }

}

FormElementRegistry.register("BoolOrLogicListInput", BoolOrLogicListInput);
customElements.define("emc-field-input-boolorlogic-list", BoolOrLogicListInput);
