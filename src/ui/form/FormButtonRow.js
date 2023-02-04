import CustomElement from "../element/CustomElement.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js"
import TPL from "./FormButtonRow.js.html" assert {type: "html"};
import STYLE from "./FormButtonRow.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./FormButtonRow.js.form-config.json" assert {type: "json"};

export default class FormButtonRow extends CustomElement {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    static get formConfigurationCanHaveChildren() {
        return true;
    }

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-form-buttonrow", FormButtonRow);
