import CustomElement from "../element/CustomElement.js";
import CustomActionRegistry from "../../data/registry/CustomActionRegistry.js";
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
import CellRendererManager from "../../util/grid/CellRenderer.js";
import Column from "./Column.js";
import TPL from "./DataGrid.js.html" assert {type: "html"};
import STYLE from "./DataGrid.js.css" assert {type: "css"};

/** TODO detect child attribute changes
 *  - if the content of child or the attributes change, react accordingly
 */

export default class DataGrid extends CustomElement {

    #headerEl;

    #bodyEl;

    #emptyEl;

    #columnContainerEl;

    #columns = [];

    #data = [];

    #customActionRegistry = new CustomActionRegistry();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#bodyEl = this.shadowRoot.getElementById("body");
        this.#emptyEl = this.shadowRoot.getElementById("empty");
        /* --- */
        this.#columnContainerEl = this.shadowRoot.getElementById("column-container");
        this.#columnContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        CellRendererManager.addEventListener("header", (event) => {
            if (this.#columns.some((el) => el.type === event.data.type)) {
                this.#refreshHeader()
            }
        });
        CellRendererManager.addEventListener("cell", (event) => {
            if (this.#columns.some((el) => el.type === event.data.type)) {
                this.#refreshCells()
            }
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
                this.#bodyEl.innerHTML = "";
                this.#emptyEl.classList.remove("hidden");
            } else {
                this.#data = deepClone(rows);
                this.#refreshCells();
            }
        }
    }

    set columns(value) {
        this.setJSONAttribute("columns", value);
    }

    #generateColumns() {
        const columnNodeList = this.#columnContainerEl.assignedElements({flatten: true}).filter((el) => el instanceof Column);
        this.#columns = [];
        this.#headerEl.innerHTML = "";
        for (const columnEl of columnNodeList) {
            const columnData = getAllAttributes(columnEl);
            this.#columns.push(columnData);
            const headerCellEl = document.createElement("th");
            const {type, name, label, ...options} = columnData;
            CellRendererManager.renderHeader(this, headerCellEl, type, name, label, options);
            this.#headerEl.append(headerCellEl);
        }
        const lastHeaderCellEl = document.createElement("th");
        lastHeaderCellEl.classList.add("lastCell");
        this.#headerEl.append(lastHeaderCellEl);
        if (this.#data.length > 0) {
            this.#refreshCells();
        }
    }

    #refreshHeader() {
        this.#headerEl.innerHTML = "";
        for (const columnData of this.#columns) {
            const headerCellEl = document.createElement("th");
            const {type, name, label, ...options} = columnData;
            CellRendererManager.renderHeader(this, headerCellEl, type, name, label, options);
            headerCellEl.innerText = columnData.label ?? columnData.name;
            this.#headerEl.append(headerCellEl);
        }
        const lastHeaderCellEl = document.createElement("th");
        lastHeaderCellEl.classList.add("lastCell");
        this.#headerEl.append(lastHeaderCellEl);
    }

    #refreshCells() { // XXX element manager?
        this.#bodyEl.innerHTML = "";
        if (this.#data.length > 0) {
            this.#emptyEl.classList.add("hidden");
            for (const rowData of this.#data) {
                const rowEl = document.createElement("tr");
                for (const column of this.#columns) {
                    const {type, name, ...options} = column;
                    const cellEl = document.createElement("td");
                    CellRendererManager.renderCell(this, cellEl, type, name, rowData, options);
                    rowEl.append(cellEl);
                }
                const lastCellEl = document.createElement("td");
                lastCellEl.classList.add("lastCell");
                rowEl.append(lastCellEl);
                this.#bodyEl.append(rowEl);
            }
        } else {
            this.#emptyEl.classList.remove("hidden");
        }
    }

    #onSlotChange = debounce(() => {
        this.#generateColumns();
    });

    registerCustomAction(name, fn) {
        this.#customActionRegistry.set(name, fn);
        this.#refreshCells(); // TODO add better refresh for only custom action related cells
    }

    getCustomAction(name) {
        return this.#customActionRegistry.get(name);
    }

}

customElements.define("emc-grid-datagrid", DataGrid);
