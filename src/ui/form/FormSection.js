import CustomElement from "../element/CustomElement.js";
import {deepClone} from "../../util/helper/DeepClone.js";
import {findAllParentsBySelector} from "../../util/helper/ui/FindParentBySelector.js";
import {delimitInteger} from "../../util/helper/number/Integer.js";
import "../i18n/I18nLabel.js";
import TPL from "./FormSection.js.html" assert {type: "html"};
import STYLE from "./FormSection.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./FormSection.js.json" assert {type: "json"};

export default class FormSection extends CustomElement {

    #headerEl;

    #labelEl = document.createElement("emc-i18n-label");

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    static get formConfigurationCanHaveChildren() {
        return true;
    }

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#headerEl = this.shadowRoot.getElementById("header");
    }

    connectedCallback() {
        const parentSectionEls = findAllParentsBySelector(this, "emc-form-section");
        const level = parentSectionEls.length + 1;

        const sectionHeadingEl = document.createElement(`h${delimitInteger(level, 1, 6)}`);
        sectionHeadingEl.appendChild(this.#labelEl);
        this.#headerEl.appendChild(sectionHeadingEl);
    }

    disconnectedCallback() {
        this.#headerEl.innerHTML = "";
    }

    set label(value) {
        this.setStringAttribute("label", value);
    }

    get label() {
        return this.getStringAttribute("label");
    }

    static get observedAttributes() {
        return ["label"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "label": {
                    this.#labelEl.i18nValue = newValue;
                } break;
            }
        }
    }

}

customElements.define("emc-form-section", FormSection);
