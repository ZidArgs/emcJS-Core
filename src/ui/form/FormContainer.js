import CustomElement from "../element/CustomElement.js";
import TPL from "./FormContainer.js.html" assert {type: "html"};
import STYLE from "./FormContainer.js.css" assert {type: "css"};

export default class FormContainer extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-form-container", FormContainer);
