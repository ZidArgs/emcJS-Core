import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nInput.js";
import TPL from "./SubmitButton.js.html" assert {type: "html"};
import STYLE from "./SubmitButton.js.css" assert {type: "css"};

export default class SubmitButton extends CustomFormElementDelegating {

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

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["value", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
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
