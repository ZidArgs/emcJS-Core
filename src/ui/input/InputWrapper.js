import CustomElement from "../element/CustomElement.js";
import TPL from "./InputWrapper.html" assert {type: "html"};
import STYLE from "./InputWrapper.css" assert {type: "css"};

export default class InputWrapper extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-input-wrapper", InputWrapper);
