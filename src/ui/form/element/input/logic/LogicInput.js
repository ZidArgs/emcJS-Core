import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import DragDropMemory from "../../../../../data/DragDropMemory.js";
import ContextMenuManagerMixin from "../../../../mixin/ContextMenuManagerMixin.js";
import {mix} from "../../../../../util/Mixin.js";
import {reduceLogic} from "../../../../../util/logic/LogicReducer.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import LogicEditorContextMenuElement from "./components/contexmenu/LogicEditorContextMenuElement.js";
import LogicElementModal from "./components/modal/LogicElementModal.js";
import LogicJSONModal from "./components/modal/LogicJSONModal.js";
import LogicAbstractElement from "../../../../logic/abstract/AbstractElement.js";
import "../../../FormRow.js";
import "../../../button/Button.js";
import "../../../../logic/DefaultElementsLoader.js";
import TPL from "./LogicInput.js.html" assert {type: "html"};
import STYLE from "./LogicInput.js.css" assert {type: "css"};

// TODO add import/export (button opens dialog to copy/paste logic)
// TODO add optimize button (optimize logic e.g. merge contained AND with parent AND)
// TODO add negate function to contextmenu (add optional negation readonly property to logic elements)
// TODO detect valid logic (no empty elements that expect children)

const MUTATION_CONFIG = {
    childList: true,
    subtree: true
};

const mutationObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type == "childList") {
            const target = mutation.target.closest("emc-input-logic");
            const el = target.children[0];
            if (el) {
                target.value = el.toJSON();
            } else {
                target.value = null;
            }
        }
    }
});

const BaseClass = mix(AbstractFormElement).with(ContextMenuManagerMixin);

// TODO use modal handler
export default class LogicInput extends BaseClass {

    static get changeDebounceTime() {
        return 0;
    }

    #optimizeButtonEl;

    #jsonButtonEl;

    #placeholderEl;

    #logicElementModal = new LogicElementModal();

    #logicJSONModal = new LogicJSONModal();

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.setContextMenu("element", LogicEditorContextMenuElement);
        this.addContextMenuHandler("element", "remove", (event) => {
            const {id} = event.props[0];
            this.#removeElement(id);
        });
        this.registerTargetEventHandler(this, "menu", (event) => {
            const {id} = event;
            this.showContextMenu("element", event, {id});
            event.stopPropagation();
        });
        /* --- */
        mutationObserver.observe(this, MUTATION_CONFIG);
        this.#optimizeButtonEl = this.shadowRoot.getElementById("optimize");
        this.#jsonButtonEl = this.shadowRoot.getElementById("json");
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
        this.registerTargetEventHandler(this.#placeholderEl, "click", (event) => {
            const e = new Event("placeholderclicked");
            this.dispatchEvent(e);
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#optimizeButtonEl, "click", (event) => {
            this.value = reduceLogic(this.value);
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#jsonButtonEl, "click", (event) => {
            this.#logicJSONModal.value = this.value;
            this.#logicJSONModal.show(this.readonly);
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#logicJSONModal, "submit", () => {
            this.value = this.#logicJSONModal.value;
        });
        this.registerTargetEventHandler(this, "click", (event) => {
            event.stopImmediatePropagation();
            event.preventDefault();
            const targetEl = event.target;
            setTimeout(() => {
                if (targetEl instanceof LogicAbstractElement) {
                    targetEl.focus();
                } else {
                    const firstEl = this.children[0] ?? this.#placeholderEl;
                    firstEl.focus();
                }
            }, 0);
        });
        /* --- */
        this.registerTargetEventHandler(this, "placeholderclicked", (event) => {
            if (this.#logicElementModal != null) {
                const targetEl = event.target;
                const slotName = event.name;
                this.#logicElementModal.onsubmit = (event) => {
                    const resultEl = event.element;
                    if (slotName) {
                        resultEl.setAttribute("slot", slotName);
                    }
                    targetEl.append(resultEl);
                    resultEl.focus();
                };
                this.#logicElementModal.show();
            }
        });
        this.registerTargetEventHandler(this, "valuechange", (event) => {
            event.stopPropagation();
            const el = this.children[0];
            if (el) {
                this.value = el.toJSON();
            } else {
                this.value = null;
            }
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#optimizeButtonEl.disabled = disabled;
        this.#jsonButtonEl.disabled = disabled;
        this.#placeholderEl.disabled = disabled;
        const el = this.children[0];
        if (el) {
            return el.disabled = disabled;
        }
    }

    focus(options) {
        super.focus(options);
        const el = this.children[0];
        if (el) {
            el.focus(options);
        } else {
            this.#placeholderEl.focus(options);
        }
    }

    addOperatorGroup(...groupList) {
        this.#logicElementModal?.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#logicElementModal?.removeOperatorGroup(...groupList);
    }

    set defaultValue(value) {
        this.setJSONAttribute("value", value);
    }

    get defaultValue() {
        return this.getJSONAttribute("value");
    }

    set value(value) {
        if (value == null || typeof value === "object" && !Array.isArray(value)) {
            super.value = value;
        }
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "name": {
                if (oldValue != newValue) {
                    this.#logicElementModal = LogicElementModal.getModalByName(newValue);
                    this.#logicElementModal.name = newValue;
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    const el = this.children[0];
                    const value = newValue != null && newValue != "false";
                    if (el != null) {
                        el.readonly = value;
                    }
                }
            } break;
        }
    }

    append(el) {
        const isActive = (!this.readonly || this.readonly === "false") && (!this.disabled || this.disabled === "false");
        if (el instanceof LogicAbstractElement && isActive) {
            return super.append(el);
        }
    }

    checkValid() {
        const el = this.children[0];
        if (el != null && !el.checkValidity()) {
            return "Not a valid logic";
        }
        return super.checkValid();
    }

    renderValue(value) {
        if (value == null) {
            this.innerHTML = "";
        } else {
            this.#buildLogic(value);
        }
    }

    #removeElement(id) {
        const el = this.querySelector(`#${id}`);
        if (el != null && (typeof el.template != "string" || el.template == "false")) {
            const parentEl = el.parentElement;
            parentEl.removeChild(el);
            parentEl.focus();
        }
    }

    #buildLogic(data) {
        this.innerHTML = "";
        if ("type" in data) {
            const logicEl = LogicAbstractElement.buildLogic(data);
            logicEl.readonly = this.readonly;
            super.append(logicEl);
        }
    }

}

FormElementRegistry.register("LogicInput", LogicInput);
customElements.define("emc-input-logic", LogicInput);
registerFocusable("emc-input-logic");
