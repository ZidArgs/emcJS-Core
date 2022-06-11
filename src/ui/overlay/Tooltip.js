import CustomElement from "../element/CustomElement.js";
import TPL from "./Tooltip.js.html" assert {type: "html"};
import STYLE from "./Tooltip.js.css" assert {type: "css"};

export default class Tooltip extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get position() {
        return this.getAttribute("position");
    }

    set position(val) {
        this.setAttribute("position", val);
    }

}

customElements.define("emc-tooltip", Tooltip);
