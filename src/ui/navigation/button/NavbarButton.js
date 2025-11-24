import CustomElement from "../../element/CustomElement.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTooltip.js";
import TPL from "./NavbarButton.js.html" assert {type: "html"};
import STYLE from "./NavbarButton.js.css" assert {type: "css"};

export default class NavbarButton extends CustomElement {

    #tooltipEl;

    #labelEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#labelEl = this.shadowRoot.getElementById("label");
    }

    get expand() {
        return this.getAttribute("expand");
    }

    set expand(val) {
        if (val == "open" || val == "closed") {
            this.setAttribute("expand", val);
        } else {
            this.removeAttribute("expand");
        }
    }

    get content() {
        return this.getAttribute("content");
    }

    set content(val) {
        this.setAttribute("content", val);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set tooltip(val) {
        this.setAttribute("tooltip", val);
    }

    static get observedAttributes() {
        return ["content", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "content":
                    this.#labelEl.i18nValue = newValue;
                    break;
                case "tooltip":
                    this.#tooltipEl.i18nTooltip = newValue;
                    break;
            }
        }
    }

}

customElements.define("emc-navbar-button", NavbarButton);
