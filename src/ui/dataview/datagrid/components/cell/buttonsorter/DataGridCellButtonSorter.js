import DataGridCell from "../DataGridCell.js";
import "../../../../../form/button/Button.js";
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

    static get observedAttributes() {
        return [...super.observedAttributes, "disabled", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "disabled":
                case "readonly": {
                    this.#sortUpEl.disabled = this.disabled || this.readonly;
                    this.#sortDownEl.disabled = this.disabled || this.readonly;
                } break;
            }
        }
    }

    #onClickUp(event) {
        event.stopPropagation();
        event.preventDefault();
        const ev = new Event("move-row-up", {bubbles: true});
        ev.data = {rowKey: this.rowKey};
        this.dispatchEvent(ev);
    }

    #onClickDown(event) {
        event.stopPropagation();
        event.preventDefault();
        const ev = new Event("move-row-down", {bubbles: true});
        ev.data = {rowKey: this.rowKey};
        this.dispatchEvent(ev);
    }

}

DataGridCell.registerCellType("button-sorter", DataGridCellButtonSorter, 40);
customElements.define("emc-datagrid-cell-button-sorter", DataGridCellButtonSorter);
