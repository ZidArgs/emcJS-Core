import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import TPL from "./SwitchInput.js.html" assert {type: "html"};
import STYLE from "./SwitchInput.js.css" assert {type: "css"};

export default class SwitchInput extends AbstractFormInput {

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

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        if (value == null || value === "") {
            this.#inputEl.checked = false;
            this.#inputEl.indeterminate = true;
        } else if (!value || value === "false") {
            this.#inputEl.checked = false;
            this.#inputEl.indeterminate = false;
        } else {
            this.#inputEl.checked = true;
            this.#inputEl.indeterminate = false;
        }
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        const convertedValue = value ?? this.defaultValue;
        if (convertedValue === "") {
            this.#inputEl.checked = false;
            this.#inputEl.indeterminate = true;
            super.value = null;
        } else if (!convertedValue || convertedValue === "false") {
            this.#inputEl.checked = false;
            this.#inputEl.indeterminate = false;
            super.value = false;
        } else {
            this.#inputEl.checked = true;
            this.#inputEl.indeterminate = false;
            super.value = true;
        }
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (newValue === "") {
                        this.#inputEl.removeAttribute("checked");
                        this.#inputEl.setAttribute("indeterminate", "");
                    } else if (!newValue || newValue === "false") {
                        this.#inputEl.removeAttribute("checked");
                        this.#inputEl.removeAttribute("indeterminate");
                    } else {
                        this.#inputEl.setAttribute("checked", "");
                        this.#inputEl.removeAttribute("indeterminate");
                    }
                    if (!this.isChanged) {
                        const value = this.value;
                        if (value == null || value === "") {
                            this.#inputEl.checked = false;
                            this.#inputEl.indeterminate = true;
                        } else if (!value || value === "false") {
                            this.#inputEl.checked = false;
                            this.#inputEl.indeterminate = false;
                        } else {
                            this.#inputEl.checked = true;
                            this.#inputEl.indeterminate = false;
                        }
                    }
                }
            } break;
        }
    }

    setCustomValidity(message) {
        super.setCustomValidity(message, this.#inputEl);
    }

}

FormElementRegistry.register("SwitchInput", SwitchInput);
customElements.define("emc-field-input-switch", SwitchInput);
