import CustomElement from "../../../../element/CustomElement.js";
import TPL from "./ImageIconPreview.js.html" assert {type: "html"};
import STYLE from "./ImageIconPreview.js.css" assert {type: "css"};

export default class ImageIconPreview extends CustomElement {

    #iconEl;

    #textEl;

    #tooltipEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
    }

    set text(value) {
        this.setAttribute("text", value);
    }

    get text() {
        return this.getAttribute("text");
    }

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    static get observedAttributes() {
        return ["value", "text"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#iconEl.style.backgroundImage = `url("${newValue}")`;
                }
            } break;
            case "text": {
                if (oldValue != newValue) {
                    this.#textEl.i18nValue = newValue;
                    this.#tooltipEl.i18nTooltip = newValue;
                }
            } break;
        }
    }

    get innerText() {
        return this.#textEl.innerText;
    }

}

customElements.define("emc-select-icon-image-preview", ImageIconPreview);
