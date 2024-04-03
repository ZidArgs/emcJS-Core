import DataGridCell from "../DataGridCell.js";
import "../../../../form/button/Button.js";
import TPL from "./DataGridCellButton.js.html" assert {type: "html"};
import STYLE from "./DataGridCellButton.js.css" assert {type: "css"};

export default class DataGridCellButton extends DataGridCell {

    #inputEl;

    constructor(dataGridId) {
        super(dataGridId);
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        /* --- */
        this.#inputEl.addEventListener("click", (event) => {
            this.#onClick(event);
        });
    }

    get text() {
        return this.getAttribute("text");
    }

    set text(val) {
        this.setAttribute("text", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "text"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "text": {
                    this.onValueChange(this.value);
                } break;
            }
        }
    }

    onValueChange(value) {
        if (this.text != null && this.text != "") {
            this.#inputEl.text = this.text;
        } else if (value != null && value != "") {
            this.#inputEl.text = value;
        } else {
            this.#inputEl.text = "...";
        }
    }

    #onClick(event) {
        event.stopPropagation();
        event.preventDefault();
        const ev = new Event("action", {bubbles: true});
        ev.data = {
            action: this.action,
            columnName: this.columnName,
            rowKey: this.rowKey
        };
        this.dispatchEvent(ev);
    }

}

DataGridCell.registerCellType("button", DataGridCellButton, 100);
customElements.define("emc-grid-datagrid-cell-button", DataGridCellButton);
