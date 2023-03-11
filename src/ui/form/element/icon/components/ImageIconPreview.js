import CustomElement from "./element/CustomElement.js";
import TPL from "./ImageIconPreview.js.html" assert {type: "html"};
import STYLE from "./ImageIconPreview.js.css" assert {type: "css"};

export default class ImageIconPreview extends CustomElement {

    #iconEl;

    #textEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#textEl = this.shadowRoot.getElementById("text");
    }

    get src() {
        return this.getAttribute("src");
    }

    set src(val) {
        this.setAttribute("src", val);
    }

    set text(value) {
        this.setAttribute("text", value);
    }

    get text() {
        return this.getAttribute("text");
    }

    static get observedAttributes() {
        return ["src", "text"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "src": {
                if (oldValue != newValue) {
                    this.#iconEl.style.backgroundImage = `url("${newValue}")`;
                }
            } break;
            case "text": {
                if (oldValue != newValue) {
                    this.#textEl.i18nValue = newValue;
                }
            } break;
        }
    }

    get innerText() {
        return this.#textEl.innerText;
    }

}

customElements.define("emc-select-icon-image-preview", ImageIconPreview);
