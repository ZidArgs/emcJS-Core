import CustomDelegatingElement from "../CustomElement/CustomDelegatingElement.js";
// import TPL from "./ChevronUpSymbol.html" assert {type: "html"};
import STYLE from "./ChevronUpSymbol.css" assert {type: "css"};

export default class Symbol extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "▲";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-chevron-up", Symbol);
