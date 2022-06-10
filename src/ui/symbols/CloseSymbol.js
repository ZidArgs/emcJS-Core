import CustomDelegatingElement from "../element/CustomDelegatingElement.js";
// import TPL from "./CloseSymbol.html" assert {type: "html"};
import STYLE from "./CloseSymbol.css" assert {type: "css"};

export default class Symbol extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "✖";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-close", Symbol);
