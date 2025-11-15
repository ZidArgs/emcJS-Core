import CustomElement from "../element/CustomElement.js";
import {deepClone} from "../../util/helper/DeepClone.js";
import {findAllParentsBySelector} from "../../util/helper/ui/FindParentBySelector.js";
import {delimitInteger} from "../../util/helper/number/Integer.js";
import "../i18n/I18nLabel.js";
import TPL from "./FormSection.js.html" assert {type: "html"};
import STYLE from "./FormSection.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./FormSection.js.json" assert {type: "json"};
import {
    scrollIntoView, scrollIntoViewIfNeeded
} from "../../util/helper/ui/Scroll.js";
import {getBoundingContentRect} from "../../util/helper/html/ElementSizeHelper.js";

export default class FormSection extends CustomElement {

    #scrollToEl;

    #headerEl;

    #bodyEl;

    #labelEl = document.createElement("emc-i18n-label");

    #parentSectionEls = [];

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
        this.#scrollToEl = this.shadowRoot.getElementById("scroll-to");
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#bodyEl = this.shadowRoot.getElementById("body");
    }

    connectedCallback() {
        this.#parentSectionEls = findAllParentsBySelector(this, "emc-form-section");
        const level = delimitInteger(this.#parentSectionEls.length + 1, 1, 6);

        const sectionHeadingEl = document.createElement(`h${level}`);
        sectionHeadingEl.appendChild(this.#labelEl);
        this.#headerEl.appendChild(sectionHeadingEl);
        this.#headerEl.className = `level-${level}`;
        this.#scrollToEl.className = `level-${level}`;
    }

    disconnectedCallback() {
        this.#headerEl.innerHTML = "";
    }

    get parentSectionElementList() {
        return [...this.#parentSectionEls];
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

    scrollIntoViewIfNeeded(options) {
        scrollIntoViewIfNeeded(this.#scrollToEl, options);
    }

    scrollIntoView(options) {
        scrollIntoView(this.#scrollToEl, options);
    }

    isBodySquishedAway() {
        const headerRect = getBoundingContentRect(this.#headerEl);
        const bodyRect = getBoundingContentRect(this.#bodyEl);
        const childSectionEl = this.querySelector("emc-form-section");
        if (childSectionEl != null) {
            const childSectionElRect = getBoundingContentRect(childSectionEl);
            return bodyRect.bottom - childSectionElRect.height - 20 < headerRect.bottom;
        }
        return bodyRect.bottom - 20 < headerRect.bottom;
    }

}

customElements.define("emc-form-section", FormSection);
