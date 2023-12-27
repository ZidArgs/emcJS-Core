import CustomElement from "../../element/CustomElement.js";
import TPL from "./DataGridCell.js.html" assert {type: "html"};
import STYLE from "./DataGridCell.js.css" assert {type: "css"};

const CELL_TYPES = new Map();
const MIN_WIDTH = new Map();

export default class DataGridCell extends CustomElement {

    #contentEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
    }

    set columnName(val) {
        this.setAttribute("col-name", val);
    }

    get columnName() {
        return this.getAttribute("col-name");
    }

    set rowName(val) {
        this.setAttribute("row-name", val);
    }

    get rowName() {
        return this.getAttribute("row-name");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
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

    static createCell(name) {
        if (CELL_TYPES.has(name)) {
            const CellClass = CELL_TYPES.get(name);
            return new CellClass();
        }
        return new DataGridCell();
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

customElements.define("emc-grid-datagrid-cell", DataGridCell);
