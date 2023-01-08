import CustomElement from "../element/CustomElement.js";
import "../i18n/I18nLabel.js";
import "../i18n/I18nTextbox.js";
import TPL from "./FormField.js.html" assert {type: "html"};
import STYLE from "./FormField.js.css" assert {type: "css"};

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

// TODO store all errors based on keys
export default class FormField extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("change", (event) => {
            this.shadowRoot.getElementById("error").innerText = event.target.validationMessage ?? "";
        });
        /* --- */
        const labelEl = this.shadowRoot.getElementById("label");
        labelEl.addEventListener("click", (event) => {
            if (event.target === labelEl) {
                const firstFocusEl = this.querySelector(Q_TAB);
                if (firstFocusEl != null) {
                    firstFocusEl.focus();
                }
            }
        });
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get label() {
        return this.getAttribute("label");
    }

    set desc(value) {
        this.setAttribute("desc", value);
    }

    get desc() {
        return this.getAttribute("desc");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["label", "desc", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "label": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("text").i18nValue = newValue;
                }
            } break;
            case "desc": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("description").i18nContent = newValue;
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

customElements.define("emc-form-field", FormField);
