import CustomElement from "../element/CustomElement.js";
import {
    isEqual
} from "../../util/helper/Comparator.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import TPL from "./DataGrid.js.html" assert {type: "html"};
import STYLE from "./DataGrid.js.css" assert {type: "css"};

export default class DataGrid extends CustomElement {

    #headerEl;

    #bodyEl;

    #emptyEl;

    #data = [];

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#bodyEl = this.shadowRoot.getElementById("body");
        this.#emptyEl = this.shadowRoot.getElementById("empty");
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
                this.#refresh(this.columns, rows);
            }
        }
    }

    set columns(value) {
        this.setJSONAttribute("columns", value);
    }

    get columns() { // XXX is this better defined by slots? -> for (const v of node.attributes) console.log(v.name, v.value)
        return this.getJSONAttribute("columns");
    }

    static get observedAttributes() {
        return ["columns"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "columns": {
                if (oldValue != newValue) {
                    const columns = this.columns ?? [];
                    this.#headerEl.innerHTML = "";
                    for (const column of columns) {
                        const headerCellEl = document.createElement("th");
                        if (typeof column === "object") {
                            // TODO use cell renderer
                            // struct definition
                            headerCellEl.innerText = column.label ?? column.name;
                        } else {
                            // TODO use cell renderer
                            headerCellEl.innerText = column;
                        }
                        this.#headerEl.append(headerCellEl);
                    }
                    if (this.#data.length > 0) {
                        this.#refresh(columns, this.#data);
                    }
                }
            } break;
        }
    }

    #refresh(columns, data) { // XXX element manager?
        this.#bodyEl.innerHTML = "";
        if (data.length > 0) {
            this.#emptyEl.classList.add("hidden");

            for (const rowData of data) {
                const rowEl = document.createElement("tr");
                for (const column of columns) {
                    const cellEl = document.createElement("td");
                    if (typeof column === "object") {
                        if (column.name in rowData) {
                            // TODO use cell renderer
                            cellEl.innerText = rowData[column.name];
                        } else { // empty
                            // TODO use cell renderer
                            cellEl.innerText = "---";
                        }
                    } else if (column in rowData) {
                        // TODO use cell renderer
                        cellEl.innerText = rowData[column];
                    } else { // empty
                        // TODO use cell renderer
                        cellEl.innerText = "---";
                    }
                    rowEl.append(cellEl);
                }
                this.#bodyEl.append(rowEl);
            }
        } else {
            this.#emptyEl.classList.remove("hidden");
        }
    }

}

customElements.define("emc-grid-datagrid", DataGrid);
