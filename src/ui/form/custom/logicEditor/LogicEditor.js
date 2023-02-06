import CustomFormElement from "../../../element/CustomFormElement.js";
import DragDropMemory from "../../../../util/DragDropMemory.js";
import LogicAbstractElement from "./elements/AbstractElement.js";
import "./elements/ComparatorEqual.js";
import "./elements/ComparatorGreaterThan.js";
import "./elements/ComparatorGreaterThanEqual.js";
import "./elements/ComparatorLessThan.js";
import "./elements/ComparatorLessThanEqual.js";
import "./elements/ComparatorNotEqual.js";
import "./elements/LiteralFalse.js";
// import "./elements/LiteralNumber.js";
import "./elements/LiteralPointer.js";
import "./elements/LiteralState.js";
// import "./elements/LiteralString.js";
import "./elements/LiteralTrue.js";
import "./elements/LiteralValue.js";
import "./elements/MathAdd.js";
import "./elements/MathDiv.js";
import "./elements/MathMod.js";
import "./elements/MathMul.js";
import "./elements/MathPow.js";
import "./elements/MathSub.js";
import "./elements/OperatorAnd.js";
import "./elements/OperatorMax.js";
import "./elements/OperatorMin.js";
import "./elements/OperatorNand.js";
import "./elements/OperatorNor.js";
import "./elements/OperatorNot.js";
import "./elements/OperatorOr.js";
import "./elements/OperatorXnor.js";
import "./elements/OperatorXor.js";
import TPL from "./LogicEditor.js.html" assert {type: "html"};
import STYLE from "./LogicEditor.js.css" assert {type: "css"};

export default class LogicEditor extends CustomFormElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const target = this.shadowRoot.getElementById("droptarget");
        target.ondragover = (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };
        target.ondrop = (event) => {
            const els = DragDropMemory.get();
            if (els.length) {
                const el = els[0];
                if (el) {
                    const ne = event.target.getRootNode().host.append(el.getElement(event.ctrlKey));
                    if (ne) {
                        ne.removeAttribute("slot");
                    }
                }
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        };
        target.addEventListener("click", () => {

        });
    }

    get value() {
        const el = this.children[0];
        if (el) {
            return el.toJSON();
        }
        return null;
    }

    set value(data) {
        this.innerHTML = "";
        if (data) {
            this.append(LogicAbstractElement.buildLogic(data));
        }
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set readonly(val) {
        this.setBooleanAttribute("readonly", val);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    set disabled(val) {
        this.setBooleanAttribute("disabled", val);
    }

    append(el) {
        const isActive = (!this.readonly || this.readonly === "false") && (!this.disabled || this.disabled === "false");
        if (el instanceof LogicAbstractElement && isActive) {
            return super.append(el);
        }
    }

}

customElements.define("emc-edit-logic", LogicEditor);
