import CustomDelegatingElement from "../CustomElement/CustomDelegatingElement.js";
// import TPL from "./ChevronLeftSymbol.html" assert {type: "html"};
import STYLE from "./ChevronLeftSymbol.css" assert {type: "css"};

export default class Symbol extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "◀";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-chevron-left", Symbol);
