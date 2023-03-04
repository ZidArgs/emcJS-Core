import AbstractElement from "./abstract/AbstractElement.js";
import AbstractInfChildrenElement from "./abstract/AbstractInfChildrenElement.js";
import STYLE from "./styles/OperatorNand.css" assert {type: "css"};

const TPL_CAPTION = "NAND";
const REFERENCE = "nand";

export default class OperatorNand extends AbstractInfChildrenElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(state = {}) {
        const ch = this.childList.map((el) => el.calculate(state));
        for (const val of ch) {
            if (!val) {
                this.shadowRoot.getElementById("header").setAttribute("value", "1");
                return 1;
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", "0");
        return 0;
    }

}

AbstractElement.registerReference(REFERENCE, OperatorNand);
customElements.define(`emc-logic-${REFERENCE}`, OperatorNand);
