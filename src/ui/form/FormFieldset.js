import CustomElement from "../element/CustomElement.js";
import "../i18n/I18nLabel.js";
import TPL from "./FormFieldset.js.html" assert {type: "html"};
import STYLE from "./FormFieldset.js.css" assert {type: "css"};

export default class FormFieldset extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
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

customElements.define("emc-form-fieldset", FormFieldset);
