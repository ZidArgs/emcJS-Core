import AbstractElement from "./abstract/AbstractElement.js";
import STYLE from "./styles/LiteralFalse.css" assert {type: "css"};

const TPL_CAPTION = "FALSE";
const REFERENCE = "false";

export default class LiteralFalse extends AbstractElement {

    constructor() {
        super(TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(/* state = {} */) {
        this.shadowRoot.getElementById("header").setAttribute("value", "0");
        return 0;
    }

    toJSON() {
        return {type: REFERENCE};
    }

    loadLogic(/* logic */) {}

}

AbstractElement.registerReference(REFERENCE, LiteralFalse);
customElements.define(`emc-logic-${REFERENCE}`, LiteralFalse);
