import CustomElement from "../element/CustomElement.js";
import TPL from "./FormButtonRow.js.html" assert {type: "html"};
import STYLE from "./FormButtonRow.js.css" assert {type: "css"};

// TODO store all errors based on keys
export default class FormButtonRow extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-form-button-row", FormButtonRow);
