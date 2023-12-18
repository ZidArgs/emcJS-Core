import CustomFormElement from "../../element/CustomFormElement.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "./AbstractFormField.js.html" assert {type: "html"};
import STYLE from "./AbstractFormField.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./AbstractFormField.js.json" assert {type: "json"};

export default class AbstractFormField extends CustomFormElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    static get formConfigurationCanHaveChildren() {
        return false;
    }

    constructor() {
        if (new.target === AbstractFormField) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("validity", (event) => {
            this.shadowRoot.getElementById("error").i18nContent = event.target.validationMessage ?? "";
        });
        /* --- */
        const errorEl = this.shadowRoot.getElementById("error");
        errorEl.addEventListener("click", (event) => {
            this.focus();
            event.preventDefault();
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

    formContextAssociatedCallback(/* formContext */) {
        // ignore
    }

}
