import CustomElement from "../../element/CustomElement.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTooltip.js";
import TPL from "./Button.js.html" assert {type: "html"};
import STYLE from "./Button.js.css" assert {type: "css"};

export default class Button extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
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
            const tooltip = this.shadowRoot.getElementById("tooltip");
            const label = this.shadowRoot.getElementById("label");
            switch (name) {
                case "content":
                    label.i18nValue = newValue;
                    break;
                case "tooltip":
                    tooltip.i18nTooltip = newValue;
                    break;
            }
        }
    }

}

customElements.define("emc-navbar-button", Button);
