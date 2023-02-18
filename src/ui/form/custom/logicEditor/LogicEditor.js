import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import ContextMenuManagerMixin from "../../../mixin/ContextMenuManagerMixin.js";
import {
    mix
} from "../../../../util/Mixin.js";
import DragDropMemory from "../../../../util/DragDropMemory.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import LogicEditorContextMenuElement from "./contexmenu/LogicEditorContextMenuElement.js";
import LogicElementWindow from "./components/LogicElementWindow.js";
import LogicAbstractElement from "./elements/abstract/AbstractElement.js";
import "./elements/ComparatorEqual.js";
import "./elements/ComparatorGreaterThan.js";
import "./elements/ComparatorGreaterThanEqual.js";
import "./elements/ComparatorLessThan.js";
import "./elements/ComparatorLessThanEqual.js";
import "./elements/ComparatorNotEqual.js";
import "./elements/LiteralFalse.js";
// import "./elements/LiteralNumber.js";
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
import "./elements/OperatorNand.js";
import "./elements/OperatorNor.js";
import "./elements/OperatorNot.js";
import "./elements/OperatorOr.js";
import "./elements/OperatorXnor.js";
import "./elements/OperatorXor.js";
import "./elements/RestrictorMax.js";
import "./elements/RestrictorMin.js";
import TPL from "./LogicEditor.js.html" assert {type: "html"};
import STYLE from "./LogicEditor.js.css" assert {type: "css"};

// TODO add string input logic element
// TODO add number input logic element

const MUTATION_CONFIG = {
    childList: true,
    subtree: true
};

const mutationObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type == "childList") {
            const target = mutation.target.closest("emc-edit-logic");
            target.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
        }
    }
});

const BaseClass = mix(
    CustomFormElementDelegating
).with(
    ContextMenuManagerMixin
);

export default class LogicEditor extends BaseClass {

    #placeholderEl;

    #logicElementWindow = new LogicElementWindow();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.setContextMenu("element", LogicEditorContextMenuElement);
        this.addContextMenuHandler("element", "remove", (event) => {
            const {id} = event.props;
            this.#removeElement(id);
        });
        this.addEventListener("menu", (event) => {
            const {id} = event;
            this.showContextMenu("element", event, {id});
            event.stopPropagation();
        });
        /* --- */
        mutationObserver.observe(this, MUTATION_CONFIG);
        this.#placeholderEl = this.shadowRoot.getElementById("droptarget");
        this.#placeholderEl.ondragover = (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };
        this.#placeholderEl.ondrop = (event) => {
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
        this.#placeholderEl.addEventListener("click", (event) => {
            const e = new Event("placeholderclicked");
            this.dispatchEvent(e);
            event.stopPropagation();
        });
        /* --- */
        this.addEventListener("placeholderclicked", (event) => {
            const targetEl = event.target;
            const slotName = event.name;
            this.#logicElementWindow.onsubmit = (event) => {
                const resultEl = event.element;
                if (slotName) {
                    resultEl.setAttribute("slot", slotName);
                }
                targetEl.append(resultEl);
            };
            this.#logicElementWindow.show();
        });
        this.addEventListener("valuechange", (event) => {
            this.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
            event.stopPropagation();
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#placeholderEl.disabled = disabled;
        const el = this.children[0];
        if (el) {
            return el.disabled = disabled;
        }
    }

    loadOperators(operators) {
        this.#logicElementWindow.loadOperators(operators);
    }

    #removeElement(id) {
        const el = this.querySelector(`#${id}`);
        if (el != null && (typeof el.template != "string" || el.template == "false")) {
            el.parentElement.removeChild(el);
        }
    }

    set value(data) {
        if (data == null) {
            this.innerHTML = "";
        } else if (!isEqual(this.value, data)) {
            this.innerHTML = "";
            const buildLogic = LogicAbstractElement.buildLogic(data);
            this.append(buildLogic);
        }
    }

    get value() {
        const el = this.children[0];
        if (el) {
            return el.toJSON();
        }
        return null;
    }

    set readonly(val) {
        this.setBooleanAttribute("readonly", val);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set disabled(val) {
        this.setBooleanAttribute("disabled", val);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    append(el) {
        const isActive = (!this.readonly || this.readonly === "false") && (!this.disabled || this.disabled === "false");
        if (el instanceof LogicAbstractElement && isActive) {
            return super.append(el);
        }
    }

}

customElements.define("emc-edit-logic", LogicEditor);
