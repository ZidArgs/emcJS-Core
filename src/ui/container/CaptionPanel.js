import CustomElement from "../element/CustomElement.js";
import TPL from "./CaptionPanel.js.html" assert {type: "html"};
import STYLE from "./CaptionPanel.js.css" assert {type: "css"};

export default class CaptionPanel extends CustomElement {

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
                    this.shadowRoot.getElementById("title").innerHTML = newValue;
                }
                break;
        }
    }

}

customElements.define("emc-captionpanel", CaptionPanel);
