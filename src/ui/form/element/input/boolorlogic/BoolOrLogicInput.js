import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import "../../../../i18n/builtin/I18nInput.js";
import {registerFocusable} from "../../../../../util/helper/html/getFocusableElements.js";
import "../../../../i18n/builtin/I18nOption.js";
import "../logic/LogicInput.js";
import "../../select/switch/SwitchSelect.js";
import TPL from "./BoolOrLogicInput.js.html" assert {type: "html"};
import STYLE from "./BoolOrLogicInput.js.css" assert {type: "css"};

export default class BoolOrLogicInput extends AbstractFormElement {

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
        this.#logicEl.addValidator(() => {
            return this.validationMessage;
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#logicEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        this.#inputEl.formResetCallback();
        this.#logicEl.formResetCallback();
    }

    validityCallback(message) {
        this.#logicEl.setCustomValidity(message);
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    addOperatorGroup(...groupList) {
        this.#logicEl.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#logicEl.removeOperatorGroup(...groupList);
    }

    set defaultValue(value) {
        this.setJSONAttribute("value", value);
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
        super.value = value;
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "name", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "name":{
                if (oldValue != newValue) {
                    this.#logicEl.name = newValue;
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    this.#inputEl.readonly = this.readonly;
                    this.#logicEl.readonly = this.readonly;
                }
            } break;
        }
    }

    checkValid() {
        const el = this.#logicEl.children[0];
        if (el != null && !el.checkValidity()) {
            return "Not a valid logic";
        }
        return super.checkValid();
    }

    renderValue(value) {
        if (typeof value === "object") {
            this.#inputEl.value = "logic";
            this.#logicEl.value = value;
        } else if (value === false) {
            this.#inputEl.value = "false";
            this.#logicEl.value = null;
        } else {
            this.#inputEl.value = "true";
            this.#logicEl.value = null;
        }
    }

    onDisplayValueChange(value) {
        if (typeof value === "object") {
            this.#logicEl.classList.add("active");
        } else if (value === false) {
            this.#logicEl.classList.remove("active");
        } else {
            this.#logicEl.classList.remove("active");
        }
    }

}

FormElementRegistry.register("BoolOrLogicInput", BoolOrLogicInput);
customElements.define("emc-input-boolorlogic", BoolOrLogicInput);
registerFocusable("emc-input-boolorlogic");
