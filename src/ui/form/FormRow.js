import CustomElement from "../element/CustomElement.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import {
    safeSetAttribute
} from "../../util/helper/ui/NodeAttributes.js";
import TPL from "./FormRow.js.html" assert {type: "html"};
import STYLE from "./FormRow.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./FormRow.js.json" assert {type: "json"};

export default class FormRow extends CustomElement {

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

    set align(value) {
        this.setAttribute("align", value);
    }

    get align() {
        return this.getAttribute("align");
    }

    set stretchContent(value) {
        this.setBooleanAttribute("stretch-content", value);
    }

    get stretchContent() {
        return this.getBooleanAttribute("stretch-content");
    }

    static get observedAttributes() {
        return ["disabled"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "disabled": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.shadowRoot.getElementById("fieldset"), "disabled", newValue);
                }
            } break;
        }
    }

}

customElements.define("emc-form-row", FormRow);
