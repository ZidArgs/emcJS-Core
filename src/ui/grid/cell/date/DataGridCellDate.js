import {
    debounce
} from "../../../../util/Debouncer.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import DateUtil from "../../../../util/date/DateUtil.js";
import DataGridCell from "../DataGridCell.js";
import "../../../i18n/builtin/I18nInput.js";
import TPL from "./DataGridCellDate.js.html" assert {type: "html"};
import STYLE from "./DataGridCellDate.js.css" assert {type: "css"};

export default class DataGridCellDate extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    constructor(dataGridId) {
        super(dataGridId);
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#inputEl = this.shadowRoot.getElementById("input");
        /* --- */
        this.#inputEventManager = new EventTargetManager(this.#inputEl);
        this.#inputEventManager.set("input", (event) => {
            this.#onInput(event);
        });
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable"];
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
            }
        }
    }

    onValueChange(value) {
        if (value != null && value != "") {
            if (!(value instanceof Date)) {
                value = new Date(value);
            }
            const viewValue = DateUtil.convertLocal(value, "D.M.Ys");
            const editValue = DateUtil.convertLocal(value, "Y-M-D");
            this.classList.remove("empty");
            this.#valueEl.innerText = viewValue;
            this.#valueEl.title = viewValue;
            this.#inputEl.value = editValue;
        } else {
            this.classList.add("empty");
            this.#valueEl.innerText = "";
            this.#valueEl.title = "";
            this.#inputEl.value = "";
        }
    }

    #onInput = debounce((event) => {
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
    }, 300);

}

DataGridCell.registerCellType("date", DataGridCellDate, 200);
customElements.define("emc-grid-datagrid-cell-date", DataGridCellDate);
