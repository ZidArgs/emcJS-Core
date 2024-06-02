import CustomElement from "../CustomElement/CustomElement.js";
// import TPL from "./ChevronRightSymbol.js.html" assert {type: "html"};
import STYLE from "./ChevronRightSymbol.js.css" assert {type: "css"};

export default class Symbol extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "▶";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-chevron-right", Symbol);
