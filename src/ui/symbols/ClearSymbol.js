import CustomDelegatingElement from "../element/CustomDelegatingElement.js";
// import TPL from "./ClearSymbol.html" assert {type: "html"};
import STYLE from "./ClearSymbol.css" assert {type: "css"};

export default class Symbol extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "✕";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-clear", Symbol);
