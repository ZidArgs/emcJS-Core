import AbstractElement from "./abstract/AbstractElement.js";
import AbstractInfChildrenElement from "./abstract/AbstractInfChildrenElement.js";
import STYLE from "./styles/Math.css" assert {type: "css"};

const TPL_CAPTION = "MODULO";
const REFERENCE = "mod";

export default class MathMod extends AbstractInfChildrenElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        STYLE.apply(this.shadowRoot);
    }

    calculate(state = {}) {
        const ch = this.childList.map((node) => node.calculate(state));
        let value = ch.shift() ?? 0;
        for (const val of ch) {
            const v = parseFloat(val);
            if (isNaN(v)) {
                this.shadowRoot.getElementById("header").setAttribute("value", "NaN");
                return 0;
            }
            if (v === 0) {
                this.shadowRoot.getElementById("header").setAttribute("value", "DIV 0");
                return 0;
            }
            value %= v;
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

}

AbstractElement.registerReference(REFERENCE, MathMod);
customElements.define(`emc-logic-${REFERENCE}`, MathMod);
