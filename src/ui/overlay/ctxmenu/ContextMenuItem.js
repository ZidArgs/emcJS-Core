import CustomElement from "../../element/CustomElement.js";
import TPL from "./ContextMenuItem.js.html" assert {type: "html"};
import STYLE from "./ContextMenuItem.js.css" assert {type: "css"};

export default class ContextMenuItem extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    set info(val) {
        if (val != null) {
            this.setAttribute("info", val);
        } else {
            this.removeAttribute("info");
        }
    }

    get info() {
        return this.getAttribute("info") || "";
    }

    static get observedAttributes() {
        return ["info"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "info": {
                    const infoEl = this.shadowRoot.getElementById("info");
                    if (newValue != null) {
                        infoEl.innerHTML = newValue;
                    } else {
                        infoEl.innerHTML = "";
                    }
                } break;
            }
        }
    }

}

customElements.define("emc-contextmenuitem", ContextMenuItem);
