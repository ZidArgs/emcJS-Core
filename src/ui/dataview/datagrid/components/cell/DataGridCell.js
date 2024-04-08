import CustomElementDelegating from "../../../../element/CustomElementDelegating.js";
import TPL from "./DataGridCell.js.html" assert {type: "html"};
import STYLE from "./DataGridCell.js.css" assert {type: "css"};
import {
    deepClone
} from "../../../../../util/helper/DeepClone.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";

const CELL_TYPES = new Map();
const MIN_WIDTH = new Map();

export default class DataGridCell extends CustomElementDelegating {

    #dataGridId;

    #contentEl;

    #rowData;

    constructor(dataGridId) {
        if (typeof dataGridId !== "string" || dataGridId === "") {
            throw new Error("dataGridId must be a non empty string");
        }
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#dataGridId = dataGridId;
        this.#contentEl = this.shadowRoot.getElementById("content");
    }

    get dataGridId() {
        return this.#dataGridId;
    }

    set rowData(value) {
        if (!isEqual(this.#rowData, value)) {
            this.#rowData = deepClone(value);
            const ev = new Event("rowdata");
            this.dispatchEvent(ev);
        }
    }

    get rowData() {
        return deepClone(this.#rowData);
    }

    set columnName(val) {
        this.setAttribute("col-name", val);
    }

    get columnName() {
        return this.getAttribute("col-name");
    }

    set rowKey(val) {
        this.setAttribute("row-key", val);
    }

    get rowKey() {
        return this.getAttribute("row-key");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set action(val) {
        this.setAttribute("action", val);
    }

    get action() {
        return this.getAttribute("action");
    }

    set editable(val) {
        this.setBooleanAttribute("editable", val);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

    static get observedAttributes() {
        return ["value", "col-name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "value": {
                    this.onValueChange(this.value);
                } break;
                case "col-name": {
                    const styleWidth = `var(--width-${this.columnName}, 100%)`;
                    this.#contentEl.style.minWidth = styleWidth;
                    this.#contentEl.style.width = styleWidth;
                } break;
            }
        }
    }

    onValueChange(value) {
        if (value != null && value != "") {
            this.classList.remove("empty");
            this.#contentEl.innerText = value;
        } else {
            this.classList.add("empty");
            this.#contentEl.innerText = "";
        }
    }

    static registerCellType(name, CellClass, minWidth) {
        if (typeof name !== "string" || name === "") {
            throw new TypeError("name must be a non empty string");
        }
        if (!(CellClass.prototype instanceof DataGridCell)) {
            throw new TypeError("registered types must inherit from DataGridCell");
        }
        CELL_TYPES.set(name, CellClass);
        /* --- */
        minWidth = parseFloat(minWidth);
        if (!isNaN(minWidth)) {
            MIN_WIDTH.set(name, minWidth);
        }
    }

    static createCell(name, internalDataGridId) {
        if (CELL_TYPES.has(name)) {
            const CellClass = CELL_TYPES.get(name);
            return new CellClass(internalDataGridId);
        }
        return new DataGridCell(internalDataGridId);
    }

    static isCellType(name, cellEl) {
        if (CELL_TYPES.has(name)) {
            const CellClass = CELL_TYPES.get(name);
            return cellEl.prototype === CellClass;
        }
        return false;
    }

    static getTypeMinWidth(name) {
        if (MIN_WIDTH.has(name)) {
            return MIN_WIDTH.get(name);
        }
        return 0;
    }

}

customElements.define("emc-datagrid-cell", DataGridCell);
