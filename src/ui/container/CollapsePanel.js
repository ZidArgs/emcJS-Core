import CustomElement from "../element/CustomElement.js";
import TPL from "./CollapsePanel.js.html" assert {type: "html"};
import STYLE from "./CollapsePanel.js.css" assert {type: "css"};

export default class CollapsePanel extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("title").addEventListener("click", () => {
            if (!!this.expanded && this.expanded != "false") {
                this.expanded = "false";
            } else {
                this.expanded = "true";
            }
        });
    }

    get expanded() {
        return this.getBooleanAttribute("expanded");
    }

    set expanded(val) {
        this.setBooleanAttribute("expanded", val);
    }

    get compact() {
        return this.getBooleanAttribute("compact");
    }

    set compact(val) {
        this.setBooleanAttribute("compact", val);
    }

    get caption() {
        return this.getAttribute("caption");
    }

    set caption(val) {
        this.setAttribute("caption", val);
    }

    static get observedAttributes() {
        return ["caption"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "caption":
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("text").innerHTML = newValue;
                    this.shadowRoot.getElementById("title").title = newValue;
                }
                break;
        }
    }

}

customElements.define("emc-collapsepanel", CollapsePanel);
