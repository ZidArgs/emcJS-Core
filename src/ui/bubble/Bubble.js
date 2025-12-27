import CustomElement from "../element/CustomElement.js";
import TPL from "./Bubble.js.html" assert {type: "html"};
import STYLE from "./Bubble.js.css" assert {type: "css"};

export default class Bubble extends CustomElement {

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

customElements.define("emc-bubble", Bubble);
