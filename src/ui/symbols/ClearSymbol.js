import CustomElementDelegating from "../element/CustomElementDelegating.js";
// import TPL from "./ClearSymbol.js.html" assert {type: "html"};
import STYLE from "./ClearSymbol.js.css" assert {type: "css"};

export default class Symbol extends CustomElementDelegating {

    constructor() {
        super();
        this.shadowRoot.innerHTML = "✕";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-clear", Symbol);
