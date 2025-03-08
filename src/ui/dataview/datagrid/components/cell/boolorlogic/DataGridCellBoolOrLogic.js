import EventTargetManager from "../../../../../../util/event/EventTargetManager.js";
import DataGridCell from "../DataGridCell.js";
import BoolOrLogicModal from "./components/BoolOrLogicModal.js";
import "../../../../../form/element/input/action/ActionInput.js";
import TPL from "./DataGridCellBoolOrLogic.js.html" assert {type: "html"};
import STYLE from "./DataGridCellBoolOrLogic.js.css" assert {type: "css"};

export default class DataGridCellBoolOrLogic extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    #boolOrLogicModal = new BoolOrLogicModal();

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
            this.#boolOrLogicModal.value = this.value;
            this.#boolOrLogicModal.onsubmit = (event) => {
                this.value = this.#boolOrLogicModal.value;
                this.#onInput();
                event.stopPropagation();
                event.preventDefault();
            };
            this.#boolOrLogicModal.show();
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

    addOperatorGroup(...groupList) {
        this.#boolOrLogicModal.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#boolOrLogicModal.removeOperatorGroup(...groupList);
    }

    set name(value) {
        this.#boolOrLogicModal.name = value;
    }

    get name() {
        return this.#boolOrLogicModal.name;
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable", "disabled", "readonly", "row-name"];
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
                case "row-name": {
                    this.#inputEl.setModalRefName(newValue);
                } break;
                case "col-name": {
                    this.#inputEl.name = `${this.dataGridId}-${newValue}`;
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

}

DataGridCell.registerCellType("boolorlogic", DataGridCellBoolOrLogic, 210);
customElements.define("emc-datagrid-cell-boolorlogic", DataGridCellBoolOrLogic);
