import Modal from "../../../../modal/Modal.js";
import AbstractElement from "../elements/abstract/AbstractElement.js";
import "../../../../FilteredList.js";
import "../../../../container/CollapsePanel.js";
import "../elements/ComparatorEqual.js";
import "../elements/ComparatorGreaterThan.js";
import "../elements/ComparatorGreaterThanEqual.js";
import "../elements/ComparatorLessThan.js";
import "../elements/ComparatorLessThanEqual.js";
import "../elements/ComparatorNotEqual.js";
import "../elements/LiteralFalse.js";
// import "../elements/LiteralNumber.js";
// import "../elements/LiteralString.js";
import "../elements/LiteralTrue.js";
import "../elements/MathAdd.js";
import "../elements/MathDiv.js";
import "../elements/MathMod.js";
import "../elements/MathMul.js";
import "../elements/MathPow.js";
import "../elements/MathSub.js";
import "../elements/OperatorAnd.js";
import "../elements/OperatorNand.js";
import "../elements/OperatorNor.js";
import "../elements/OperatorNot.js";
import "../elements/OperatorOr.js";
import "../elements/OperatorXnor.js";
import "../elements/OperatorXor.js";
import "../elements/RestrictorMax.js";
import "../elements/RestrictorMin.js";
import TPL from "./LogicElementModal.js.html" assert {type: "html"};
import STYLE from "./LogicElementModal.js.css" assert {type: "css"};

const DEFAULT_LOGIC_OPERATORS = [
    /* literals */
    "false", "true",
    /* operators */
    "not", "and", "nand", "or", "nor", "xor", "xnor",
    /* restrictors */
    "min", "max",
    /* comparators */
    "eq", "gt", "gte", "lt", "lte", "neq",
    /* math */
    "add", "sub", "mul", "div", "mod", "pow"
];

export default class LogicElementModal extends Modal {

    #containerEl;

    constructor() {
        super("Choose Logic Element...");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const windowEl = this.shadowRoot.getElementById("modal");
        const bodyEl = this.shadowRoot.getElementById("body");
        bodyEl.innerHTML = "";
        this.#containerEl = els.getElementById("elements");
        bodyEl.append(this.#containerEl);
        windowEl.append(els.getElementById("footer"));
        /* --- */
        const cancelEl = this.shadowRoot.getElementById("cancel");
        cancelEl.addEventListener("click", () => {
            this.close();
        });
        /* --- */
        this.#containerEl.addEventListener("click", (event) => {
            const targetEl = event.target;
            if (targetEl instanceof AbstractElement) {
                this.remove();
                const ev = new Event("submit");
                ev.element = targetEl.getElement(true);
                this.dispatchEvent(ev);
                event.preventDefault();
                return false;
            }
        });
        /* --- */
        this.#loadOperators({
            "type": "group",
            "caption": "default",
            "compact": true,
            children: DEFAULT_LOGIC_OPERATORS.map((type) => {
                return {type};
            })
        }, this.#containerEl);
    }

    loadOperators(config) {
        this.#containerEl.innerHTML = "";
        this.#loadOperators({
            "type": "group",
            "caption": "default",
            "compact": true,
            "children": DEFAULT_LOGIC_OPERATORS.map((type) => {
                return {type};
            })
        }, this.#containerEl);
        this.#loadOperators(config, this.#containerEl);
    }

    #loadOperators(config, containerEl) {
        if (config == null) {
            return;
        }
        if (Array.isArray(config)) {
            for (const item of config) {
                this.#loadOperators(item, containerEl);
            }
        } else if (config.type === "group") {
            const newConteinerEl = document.createElement("emc-collapsepanel");
            newConteinerEl.caption = config.caption;
            newConteinerEl.compact = config.compact ?? false;
            this.#loadOperators(config.children, newConteinerEl);
            containerEl.append(newConteinerEl);
        } else {
            const typeClass = AbstractElement.getReference(config.type);
            const logicEl = new typeClass();
            if (config.ref != null) {
                logicEl.ref = config.ref;
            }
            if (config.options != null && "setOptions" in logicEl) {
                logicEl.setOptions(config.options);
            }
            if (config.value != null) {
                logicEl.value = config.value;
            }
            logicEl.category = config.category;
            logicEl.template = "clicked";
            logicEl.dataset.filtervalue = config.ref ?? logicEl.getHeader() ?? config.type;
            containerEl.append(logicEl);
        }
    }

}

customElements.define("emc-edit-logic-modal-element", LogicElementModal);
