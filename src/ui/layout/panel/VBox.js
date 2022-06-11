import CustomElement from "../../element/CustomElement.js";
import TPL from "./VBox.js.html" assert {type: "html"};
import STYLE from "./VBox.js.css" assert {type: "css"};

export default class VBox extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-panel-vbox", VBox);
