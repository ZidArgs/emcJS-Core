import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nInput.js";
import TPL from "./SubmitButton.js.html" assert {type: "html"};
import STYLE from "./SubmitButton.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SubmitButton.js.form-config.json" assert {type: "json"};

export default class SubmitButton extends CustomFormElementDelegating {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            if (this.form != null) {
                this.form.requestSubmit();
            } else {
                const formEl = this.closest("emc-form");
                if (formEl != null) {
                    formEl.submit();
                }
            }
        });
    }

    formDisabledCallback(disabled) {
        this.#buttonEl.disabled = disabled;
    }

    get type() {
        return "submit";
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set text(value) {
        this.setAttribute("text", value);
    }

    get text() {
        return this.getAttribute("text");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["text", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "text": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("text").i18nValue = newValue;
                }
            } break;
            case "tooltip": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("tooltip").i18nTooltip = newValue;
                }
            } break;
        }
    }

}

customElements.define("emc-button-submit", SubmitButton);
