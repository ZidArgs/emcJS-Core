import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import BoolOrLogicModal from "./components/BoolOrLogicModal.js";
import "../../../../i18n/I18nLabel.js";
import "../../../../i18n/I18nTooltip.js";
import TPL from "./BoolOrLogicInput.js.html" assert {type: "html"};
import STYLE from "./BoolOrLogicInput.js.css" assert {type: "css"};

// TODO use modal handler
export default class BoolOrLogicInput extends CustomFormElementDelegating {

    #value;

    #textEl;

    #buttonEl;

    #boolOrLogicModal = new BoolOrLogicModal();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            this.#boolOrLogicModal.value = this.value;
            this.#boolOrLogicModal.onsubmit = () => {
                this.value = this.#boolOrLogicModal.value;
            };
            this.#boolOrLogicModal.show();
        });
    }

    setModalRefName(name) {
        this.#boolOrLogicModal.title = name;
    }

    connectedCallback() {
        const value = this.value;
        this.#value = value;
        this.#boolOrLogicModal.value = value;
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = super.value || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    addOperatorGroup(...groupList) {
        this.#boolOrLogicModal.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#boolOrLogicModal.removeOperatorGroup(...groupList);
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#boolOrLogicModal.value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? super.value;
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set required(value) {
        this.setBooleanAttribute("required", value);
    }

    get required() {
        return this.getBooleanAttribute("required");
    }

    static get observedAttributes() {
        return ["name", "value", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "name":{
                if (oldValue != newValue) {
                    this.#boolOrLogicModal = BoolOrLogicModal.getModalByName(newValue);
                    this.#boolOrLogicModal.name = newValue;
                }
            } break;
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value === undefined) {
                        this.#applyValue(this.value);
                        this.internals.setFormValue(this.value);
                        /* --- */
                        this.dispatchEvent(new Event("change"));
                    }
                }
            } break;
        }
    }

    #applyValue(value) {
        if (value === true) {
            this.#textEl.i18nValue = "True";
        } else if (value === false) {
            this.#textEl.i18nValue = "False";
        } else {
            this.#textEl.i18nValue = "Logic";
        }
    }

}

customElements.define("emc-input-boolorlogic", BoolOrLogicInput);
