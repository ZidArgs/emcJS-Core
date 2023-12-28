import Modal from "../../../../../../modal/Modal.js";
import AbstractElement from "../elements/abstract/AbstractElement.js";
import LogicOperatorRegistry from "../../../../../../../data/registry/LogicOperatorRegistry.js";
import "../../../../../../FilteredList.js";
import "../../../../../../container/CollapsePanel.js";
import "../../../../../button/Button.js";
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

// TODO use ModalDialog instead
export default class LogicElementModal extends Modal {

    #containerEl;

    #operatorGroups = new Set();

    constructor() {
        super("Choose Logic Element...");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.innerHTML = "";
        this.#containerEl = els.getElementById("elements");
        contentEl.append(this.#containerEl);
        /* --- */
        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => {
            this.close();
        });
        footerEl.append(cancelEl);
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
        LogicOperatorRegistry.addEventListener("change", (event) => {
            const {group} = event;
            if (this.#operatorGroups.has(group)) {
                this.#refreshOperatorGroup(group);
            }
        });
        LogicOperatorRegistry.addEventListener("caption", (event) => {
            const {group, caption} = event;
            if (this.#operatorGroups.has(group)) {
                const groupEl = this.#containerEl.querySelector(`emc-collapsepanel[data-group="${group}"]`);
                if (groupEl != null) {
                    groupEl.caption = caption;
                }
            }
        });
        /* --- */
        this.#refreshOperators();
    }

    addOperatorGroup(...groupList) {
        let changes = false;
        for (const group of groupList) {
            if (!(typeof group === "string") || group === "") {
                continue;
            }
            if (!this.#operatorGroups.has(group)) {
                this.#operatorGroups.add(group);
                changes = true;
            }
        }
        /* --- */
        if (changes) {
            this.#refreshOperators();
        }
    }

    removeOperatorGroup(...groupList) {
        let changes = false;
        for (const group of groupList) {
            if (!(typeof group === "string") || group === "") {
                continue;
            }
            if (this.#operatorGroups.has(group)) {
                this.#operatorGroups.delete(group);
                changes = true;
            }
        }
        /* --- */
        if (changes) {
            this.#refreshOperators();
        }
    }

    #refreshOperators() {
        this.#containerEl.innerHTML = "";
        // load default operators
        const operators = DEFAULT_LOGIC_OPERATORS.map((type) => {
            return {type};
        });
        this.#loadOperatorGroup("", "default", operators, true);
        // load custom operators
        for (const group of this.#operatorGroups) {
            const caption = LogicOperatorRegistry.getCaption(group);
            const operators = LogicOperatorRegistry.get(group);
            this.#loadOperatorGroup(group, caption, operators);
        }
    }

    #loadOperatorGroup(group, caption = group, operators = [], compact = false) {
        const groupEl = document.createElement("emc-collapsepanel");
        groupEl.dataset.group = group;
        groupEl.caption = caption;
        groupEl.compact = !!compact;
        this.#loadOperators(operators, groupEl);
        this.#containerEl.append(groupEl);
    }

    #refreshOperatorGroup(group) {
        const groupEl = this.#containerEl.querySelector(`emc-collapsepanel[data-group="${group}"]`);
        if (groupEl != null) {
            groupEl.innerHTML = "";
            const operators = LogicOperatorRegistry.get(group);
            this.#loadOperators(operators, groupEl);
        }
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
