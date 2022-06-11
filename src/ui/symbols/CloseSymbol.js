import CustomElementDelegating from "../element/CustomElementDelegating.js";
// import TPL from "./CloseSymbol.js.html" assert {type: "html"};
import STYLE from "./CloseSymbol.js.css" assert {type: "css"};

export default class Symbol extends CustomElementDelegating {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "✖";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-close", Symbol);
