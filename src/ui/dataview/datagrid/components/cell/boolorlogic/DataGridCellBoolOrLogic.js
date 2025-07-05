import EventTargetManager from "../../../../../../util/event/EventTargetManager.js";
import DataGridCell from "../DataGridCell.js";
import BoolOrLogicModal from "./components/BoolOrLogicModal.js";
import "../../../../../form/element/input/action/ActionInput.js";
import TPL from "./DataGridCellBoolOrLogic.js.html" assert {type: "html"};
import STYLE from "./DataGridCellBoolOrLogic.js.css" assert {type: "css"};

const BOOL_OR_LOGIC_MODALS = new Map();

export default class DataGridCellBoolOrLogic extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    #boolOrLogicModal;

    constructor(dataGridId) {
        super(dataGridId);
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#inputEl = this.shadowRoot.getElementById("input");
        /* --- */
        this.#inputEventManager = new EventTargetManager(this.#inputEl);
        this.#inputEventManager.set("change", (event) => {
            this.#onInput(event);
        });
        this.#inputEl.setValueRenderer((value) => this.#getRenderValue(value));
        this.#inputEl.addEventListener("action", () => {
            if (this.#boolOrLogicModal != null) {
                this.#boolOrLogicModal.value = this.value;
                this.#boolOrLogicModal.onsubmit = (event) => {
                    this.value = this.#boolOrLogicModal.value;
                    this.#onInput();
                    event.stopPropagation();
                    event.preventDefault();
                };
                this.#boolOrLogicModal.show();
            }
        });
    }

    #onInput() {
        const value = this.#inputEl.value;
        this.value = value;
        const ev = new Event("edit", {bubbles: true});
        ev.data = {
            value,
            action: this.action,
            columnName: this.columnName,
            rowKey: this.rowKey
        };
        this.dispatchEvent(ev);
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable", "disabled", "readonly", "row-key"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "editable": {
                    if (this.editable) {
                        this.#inputEventManager.active = true;
                    } else {
                        this.#inputEventManager.active = false;
                    }
                } break;
                case "disabled": {
                    this.#inputEl.disabled = this.disabled;
                } break;
                case "readonly": {
                    if (this.readonly) {
                        this.#inputEl.setAttribute("readonly", "");
                    } else {
                        this.#inputEl.removeAttribute("readonly");
                    }
                } break;
                case "row-key": {
                    // this.#inputEl.setModalRefName(newValue);
                } break;
                case "col-name": {
                    if (newValue) {
                        const inputId = `${this.dataGridId}-${this.columnName}`;
                        this.#inputEl.name = inputId;
                        this.#boolOrLogicModal = this.#getModal(inputId);
                    } else {
                        this.#inputEl.name = "";
                        this.#boolOrLogicModal = null;
                    }
                } break;
            }
        }
    }

    onValueChange(value) {
        const renderedValue = this.#getRenderValue(value);
        this.#valueEl.innerText = renderedValue;
        this.#valueEl.title = renderedValue;
        this.#inputEl.value = value;
    }

    #getRenderValue(value) {
        if (value === true) {
            return "True";
        } else if (value === false) {
            return "False";
        } else {
            return "Logic";
        }
    }

    #getModal(modalId) {
        if (modalId) {
            if (BOOL_OR_LOGIC_MODALS.has(modalId)) {
                return BOOL_OR_LOGIC_MODALS.get(modalId);
            }
            const modal = new BoolOrLogicModal();
            BOOL_OR_LOGIC_MODALS.set(modalId, modal);
            modal.name = modalId;
            return modal;
        }
    }

}

DataGridCell.registerCellType("boolorlogic", DataGridCellBoolOrLogic, 210);
customElements.define("emc-datagrid-cell-boolorlogic", DataGridCellBoolOrLogic);
