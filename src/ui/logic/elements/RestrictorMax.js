import AbstractElement from "../abstract/AbstractElement.js";
import AbstractRestrictorElement from "../abstract/AbstractRestrictorElement.js";
import STYLE from "./RestrictorMax.js.css" assert {type: "css"};

const TPL_CAPTION = "MAX";
const REFERENCE = "max";

export default class RestrictorMax extends AbstractRestrictorElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(state = {}) {
        let value;
        const ch = this.childList;
        if (ch[0]) {
            const val = ch[0].calculate(state);
            const v = parseFloat(val);
            if (isNaN(v)) {
                this.shadowRoot.getElementById("header").setAttribute("value", "NaN");
                return 0;
            }
            value = +(v <= this.shadowRoot.getElementById("input").value);
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

}

AbstractElement.registerReference(REFERENCE, RestrictorMax);
customElements.define(`emc-logic-${REFERENCE}`, RestrictorMax);
