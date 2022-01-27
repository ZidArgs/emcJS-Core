import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import CustomElement from "../../CustomElement.js";

const TPL = new Template(`
<slot id="content"></slot>
<div id="info"></div>
`);

const STYLE = new GlobalStyle(`
#info {
    color: var(--contextmenu-info, #999999);
    font-size: 0.5em;
    margin-left: 1em;
    font-style: italic;
}
#info:empty {
    display: none;
}
`);

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
