import CustomElement from "../../element/CustomElement.js";
import TPL from "./HBox.html" assert {type: "html"};
import STYLE from "./HBox.css" assert {type: "css"};

export default class HBox extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-panel-hbox", HBox);
