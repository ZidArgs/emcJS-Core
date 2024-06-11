import AbstractElement from "./abstract/AbstractElement.js";
import AbstractInfChildrenElement from "./abstract/AbstractInfChildrenElement.js";
import STYLE from "./styles/OperatorAnd.css" assert {type: "css"};

const TPL_CAPTION = "AND";
const REFERENCE = "and";

export default class OperatorAnd extends AbstractInfChildrenElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(state = {}) {
        const ch = this.childList.map((node) => node.calculate(state));
        for (const val of ch) {
            if (!val) {
                this.shadowRoot.getElementById("header").setAttribute("value", "0");
                return 0;
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", "1");
        return 1;
    }

}

AbstractElement.registerReference(REFERENCE, OperatorAnd);
customElements.define(`emc-logic-${REFERENCE}`, OperatorAnd);
