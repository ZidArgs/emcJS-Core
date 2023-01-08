import AbstractFormInput from "./AbstractFormInput.js";
import "./components/InputResetButton.js";
import "./components/ToggleShowButton.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import FormElementRegistry from "../../../data/registry/FormElementRegistry.js";
import "../../i18n/I18nTooltip.js";
import TPL from "./PasswordInput.js.html" assert {type: "html"};
import STYLE from "./PasswordInput.js.css" assert {type: "css"};

export default class PasswordInput extends AbstractFormInput {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#onInput();
        });
        this.#inputEl.addEventListener("change", (event) => {
            this.dispatchEvent(new Event("change", event));
        });
        /* --- */
        const showEl = this.shadowRoot.getElementById("show");
        this.#inputEl.type = showEl.checked ? "text" : "password";
        showEl.addEventListener("input", () => {
            this.#inputEl.type = showEl.checked ? "text" : "password";
        });
    }

    #onInput = debounce(() => {
        super.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        super.value = value;
        this.#inputEl.value = value;
    }

    get value() {
        return this.#inputEl.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.value = newValue;
                }
            } break;
        }
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    revalidate() {
        if (this.#inputEl.value == "") {
            this.#inputEl.classList.add("invalid");
            return "required";
        }
        const error = super.revalidate();
        if (error != "") {
            this.#inputEl.classList.add("invalid");
        } else {
            this.#inputEl.classList.remove("invalid");
        }
        return error;
    }

}

FormElementRegistry.register("password", PasswordInput);
customElements.define("emc-input-password", PasswordInput);
