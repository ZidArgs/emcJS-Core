import Template from "../util/html/Template.js";
import GlobalStyle from "../util/html/GlobalStyle.js";
import CustomElement from "./CustomElement.js";

const TPL = new Template(`
<div id="value">
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-block;
    width: 20px;
    height: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
#value {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    pointer-events: none;
}
`);

export default class Icon extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get src() {
        return this.getAttribute("src");
    }

    set src(val) {
        this.setAttribute("src", val);
    }

    static get observedAttributes() {
        return ["src"];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "src":
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("value").style.backgroundImage = `url("${newValue}")`;
                }
                break;
        }
    }

}

customElements.define("emc-icon", Icon);
