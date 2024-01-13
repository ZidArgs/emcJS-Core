import DataGridCell from "../DataGridCell.js";
import "../../../form/button/Button.js";
import TPL from "./DataGridCellButtonSorter.js.html" assert {type: "html"};
import STYLE from "./DataGridCellButtonSorter.js.css" assert {type: "css"};

export default class DataGridCellButtonSorter extends DataGridCell {

    #sortUpEl;

    #sortDownEl;

    constructor(dataGridId) {
        super(dataGridId);
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#sortUpEl = this.shadowRoot.getElementById("sort-up");
        this.#sortUpEl.addEventListener("click", (event) => {
            this.#onClickUp(event);
        });
        /* --- */
        this.#sortDownEl = this.shadowRoot.getElementById("sort-down");
        this.#sortDownEl.addEventListener("click", (event) => {
            this.#onClickDown(event);
        });
    }

    #onClickUp(event) {
        event.stopPropagation();
        event.preventDefault();
        const ev = new Event("move-row-up", {bubbles: true});
        ev.data = {
            rowName: this.rowName
        };
        this.dispatchEvent(ev);
    }

    #onClickDown(event) {
        event.stopPropagation();
        event.preventDefault();
        const ev = new Event("move-row-down", {bubbles: true});
        ev.data = {
            rowName: this.rowName
        };
        this.dispatchEvent(ev);
    }

}

DataGridCell.registerCellType("button-sorter", DataGridCellButtonSorter, 40);
customElements.define("emc-grid-datagrid-cell-button-sorter", DataGridCellButtonSorter);
