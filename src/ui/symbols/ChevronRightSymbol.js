import CustomDelegatingElement from "../CustomElement/CustomDelegatingElement.js";
// import TPL from "./ChevronRightSymbol.html" assert {type: "html"};
import STYLE from "./ChevronRightSymbol.css" assert {type: "css"};

export default class Symbol extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "▶";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-chevron-right", Symbol);
