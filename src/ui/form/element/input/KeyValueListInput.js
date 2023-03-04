import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import ElementListCache from "../../../../util/html/ElementListCache.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};

/*
TODO target value output:
{
    [string=key]: [string=value]
}
*/

export default class KeyValueListInput extends CustomFormElementDelegating {

    #value;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("keydown", () => {
            // TODO
        });
        this.addEventListener("blur", (event) => {
            // TODO
            event.stopPropagation();
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#value = value;
        this.#applyValue(value);
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        // TODO disable all inputs and buttons
        // this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (this.#value != value) {
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? this.getAttribute("value");
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    static get observedAttributes() {
        return ["value", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    // TODO build internal structure
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    // TODO make everything readonly
                }
            } break;
        }
    }

    #applyValue() {
        // TODO build internal structure
    }

    checkValid() {
        // TODO validate unique key
        return super.checkValid();
    }

}

customElements.define("emc-input-keyvaluelist", KeyValueListInput);
