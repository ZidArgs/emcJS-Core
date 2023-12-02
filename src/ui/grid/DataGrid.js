import CustomElement from "../element/CustomElement.js";
import {
    isEqual
} from "../../util/helper/Comparator.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import {
    debounce
} from "../../util/Debouncer.js";
import {
    getAllAttributes
} from "../../util/helper/ui/NodeAttributes.js";
import Column from "./Column.js";
import "./cell/DataGridCell.js";
import "./cell/DataGridCellButton.js";
import "./cell/DataGridCellBoolean.js";
import "./cell/DataGridCellString.js";
import "./cell/DataGridCellNumber.js";
import "./cell/DataGridCellDate.js";
import "./cell/DataGridCellDateTime.js";
import "./cell/DataGridCellTime.js";
import TPL from "./DataGrid.js.html" assert {type: "html"};
import STYLE from "./DataGrid.js.css" assert {type: "css"};
import HeaderManager from "../../util/grid/HeaderManager.js";
import RowManager from "../../util/grid/RowManager.js";

/** TODO detect child attribute changes
 *  - if the content of child or the attributes change, react accordingly
 */

export default class DataGrid extends CustomElement {

    #tableEl;

    #headerEl;

    #bodyEl;

    #emptyEl;

    #columnContainerEl;

    #columnDefinition = [];

    #data = [];

    #headerManager;

    #rowManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tableEl = this.shadowRoot.getElementById("table");
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#bodyEl = this.shadowRoot.getElementById("body");
        this.#emptyEl = this.shadowRoot.getElementById("empty");
        /* --- */
        this.#columnContainerEl = this.shadowRoot.getElementById("column-container");
        this.#columnContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        this.#onSlotChange();
        /* --- */
        this.#headerManager = new HeaderManager(this.#headerEl);
        this.#rowManager = new RowManager(this.#bodyEl);
        /* --- */
        this.#tableEl.addEventListener("action", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {action, columnName, rowName} = event.data;
            const ev = new Event(action ?? "action");
            ev.data = {
                columnName,
                rowName
            };
            this.dispatchEvent(ev);
        });
        this.#tableEl.addEventListener("edit", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, action, columnName, rowName} = event.data;
            const ev = new Event(action ?? "edit");
            ev.data = {
                value,
                columnName,
                rowName
            };
            this.dispatchEvent(ev);
        });
    }

    set nohead(value) {
        this.setAttribute("nohead", value);
    }

    get nohead() {
        return this.getAttribute("nohead");
    }

    setData(rows = []) {
        if (rows != null && !Array.isArray(rows)) {
            throw new TypeError("Data must be an array or null");
        }
        if (!isEqual(this.#data, rows)) {
            if (rows == null) {
                this.#data = [];
                this.#rowManager.purge();
                this.#emptyEl.classList.remove("hidden");
            } else {
                this.#data = deepClone(rows);
                this.#rowManager.manage(this.#data, this.#columnDefinition);
                if (this.#bodyEl.childNodes.length > 0) {
                    this.#emptyEl.classList.add("hidden");
                }
            }
        }
    }

    #applyColumnDefinition() {
        const columnNodeList = this.#columnContainerEl.assignedElements({flatten: true}).filter((el) => el instanceof Column);
        const newColumnDefinition = [];

        for (const columnEl of columnNodeList) {
            const columnData = getAllAttributes(columnEl);
            newColumnDefinition.push(columnData);
        }

        if (!isEqual(this.#columnDefinition, newColumnDefinition)) {
            this.#columnDefinition = newColumnDefinition;
            this.#headerManager.manage(newColumnDefinition);
            this.#rowManager.manage(this.#data, newColumnDefinition);
        }
    }

    #onSlotChange = debounce(() => {
        this.#applyColumnDefinition();
    });

}

customElements.define("emc-grid-datagrid", DataGrid);
