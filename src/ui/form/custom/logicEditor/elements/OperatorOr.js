import AbstractElement from "./abstract/AbstractElement.js";
import AbstractInfChildrenElement from "./abstract/AbstractInfChildrenElement.js";
import STYLE from "./styles/OperatorOr.css" assert {type: "css"};

const TPL_CAPTION = "OR";
const REFERENCE = "or";

export default class LogicElement extends AbstractInfChildrenElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(state = {}) {
        const ch = this.childList.map((el) => el.calculate(state));
        for (const val of ch) {
            if (val) {
                this.shadowRoot.getElementById("header").setAttribute("value", "1");
                return 1;
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", "0");
        return 0;
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`jse-logic-${REFERENCE}`, LogicElement);
