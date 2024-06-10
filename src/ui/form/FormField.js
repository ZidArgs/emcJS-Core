import CustomElement from "../element/CustomElement.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import {
    getFocusableElements
} from "../../util/helper/html/getFocusableElements.js";
import "../i18n/I18nLabel.js";
import "../i18n/I18nTextbox.js";
import TPL from "./FormField.js.html" assert {type: "html"};
import STYLE from "./FormField.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./FormField.js.json" assert {type: "json"};

export default class FormField extends CustomElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    static get formConfigurationCanHaveChildren() {
        return true;
    }

    #descriptionEl;

    #errorEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#descriptionEl = this.shadowRoot.getElementById("description");
        this.#errorEl = this.shadowRoot.getElementById("error");
        this.#errorEl.addEventListener("click", (event) => {
            const focusEls = getFocusableElements(this);
            focusEls[0].focus();
            event.preventDefault();
        });
        /* --- */
        this.addEventListener("validity", (event) => {
            this.#errorEl.i18nContent = event.target.validationMessage ?? "";
        });
    }

    set desc(value) {
        this.setAttribute("desc", value);
    }

    get desc() {
        return this.getAttribute("desc");
    }

    static get observedAttributes() {
        return ["desc"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "desc": {
                if (oldValue != newValue) {
                    this.#descriptionEl.i18nContent = newValue;
                }
            } break;
        }
    }

}

customElements.define("emc-form-field", FormField);
