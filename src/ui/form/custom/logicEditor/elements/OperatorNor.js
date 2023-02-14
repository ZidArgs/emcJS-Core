import AbstractElement from "./abstract/AbstractElement.js";
import AbstractInfChildrenElement from "./abstract/AbstractInfChildrenElement.js";
import STYLE from "./styles/OperatorNor.css" assert {type: "css"};

const TPL_CAPTION = "NOR";
const REFERENCE = "nor";

export default class OperatorNor extends AbstractInfChildrenElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(state = {}) {
        const ch = this.childList.map((el) => el.calculate(state));
        for (const val of ch) {
            if (val) {
                this.shadowRoot.getElementById("header").setAttribute("value", "0");
                return 0;
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", "1");
        return 1;
    }

}

AbstractElement.registerReference(REFERENCE, OperatorNor);
customElements.define(`jse-logic-${REFERENCE}`, OperatorNor);
