import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import DataGridCell from "../DataGridCell.js";
import "../../../form/element/input/boolorlogic/BoolOrLogicInput.js";
import TPL from "./DataGridCellBoolOrLogic.js.html" assert {type: "html"};
import STYLE from "./DataGridCellBoolOrLogic.js.css" assert {type: "css"};

export default class DataGridCellBoolOrLogic extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    constructor() {
        super();
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
    }

    addOperatorGroup(...groupList) {
        this.#inputEl.addOperatorGroup(...groupList);
    }

    removeOperatorGroup(...groupList) {
        this.#inputEl.removeOperatorGroup(...groupList);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get action() {
        return this.getAttribute("action");
    }

    set action(val) {
        this.setAttribute("action", val);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

    set editable(val) {
        this.setBooleanAttribute("editable", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable", "row-name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "editable": {
                    if (this.editable) {
                        this.#inputEventManager.setActive(true);
                    } else {
                        this.#inputEventManager.setActive(false);
                    }
                } break;
                case "row-name": {
                    this.#inputEl.setModalRefName(newValue);
                } break;
            }
        }
    }

    onValueChange(value) {
        if (value === true) {
            this.#valueEl.innerText = "True";
            this.#valueEl.title = "True";
        } else if (value === false) {
            this.#valueEl.innerText = "False";
            this.#valueEl.title = "False";
        } else {
            this.#valueEl.innerText = "Logic";
            this.#valueEl.title = "Logic";
        }
        this.#inputEl.value = value;
    }

    #onInput(event) {
        event.stopPropagation();
        event.preventDefault();
        const value = this.#inputEl.value;
        this.value = value;
        const ev = new Event("edit", {bubbles: true});
        ev.data = {
            value,
            action: this.action,
            columnName: this.columnName,
            rowName: this.rowName
        };
        this.dispatchEvent(ev);
    }

}

DataGridCell.registerCellType("boolorlogic", DataGridCellBoolOrLogic, 300);
customElements.define("emc-grid-datagrid-cell-boolorlogic", DataGridCellBoolOrLogic);
