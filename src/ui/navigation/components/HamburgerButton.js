import CustomElement from "../../element/CustomElement.js";
import "../../i18n/I18nTooltip.js";
import TPL from "./HamburgerButton.js.html" assert {type: "html"};
import STYLE from "./HamburgerButton.js.css" assert {type: "css"};

export default class HamburgerButton extends CustomElement {

    #tooltipEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
    }

    get open() {
        return this.getAttribute("open");
    }

    set open(val) {
        this.setAttribute("open", val);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set tooltip(val) {
        this.setAttribute("tooltip", val);
    }

    static get observedAttributes() {
        return ["tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "tooltip":
                    this.#tooltipEl.i18nTooltip = newValue;
                    break;
            }
        }
    }

}

customElements.define("emc-navbar-hamburger", HamburgerButton);
