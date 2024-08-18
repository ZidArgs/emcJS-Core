import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import TPL from "./SwitchInput.js.html" assert {type: "html"};
import STYLE from "./SwitchInput.js.css" assert {type: "css"};

export default class SwitchInput extends AbstractFormElement {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.checked;
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    applyValueAttribute(value) {
        if (value == null || value === "") {
            this.#inputEl.removeAttribute("checked");
            this.#inputEl.setAttribute("indeterminate", "");
        } else if (!value || value === "false") {
            this.#inputEl.removeAttribute("checked");
            this.#inputEl.removeAttribute("indeterminate");
        } else {
            this.#inputEl.setAttribute("checked", "");
            this.#inputEl.removeAttribute("indeterminate");
        }
    }

    set defaultValue(value) {
        this.setBooleanAttribute("value", value);
    }

    get defaultValue() {
        return this.getBooleanAttribute("value");
    }

    renderValue(value) {
        if (value == null || value === "") {
            this.#inputEl.checked = false;
            this.#inputEl.indeterminate = true;
            return null;
        }
        if (!value || value === "false") {
            this.#inputEl.checked = false;
            this.#inputEl.indeterminate = false;
            return false;
        }
        this.#inputEl.checked = true;
        this.#inputEl.indeterminate = false;
    }

}

FormElementRegistry.register("SwitchInput", SwitchInput);
customElements.define("emc-input-switch", SwitchInput);
registerFocusable("emc-input-switch");
