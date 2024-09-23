import CustomElementDelegating from "../../../../element/CustomElementDelegating.js";
import TPL from "./DataGridHeaderCell.js.html" assert {type: "html"};
import STYLE from "./DataGridHeaderCell.js.css" assert {type: "css"};

export default class DataGridHeaderCell extends CustomElementDelegating {

    #dataGridId;

    constructor(dataGridId) {
        if (typeof dataGridId !== "string" || dataGridId === "") {
            throw new Error("dataGridId must be a non empty string");
        }
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#dataGridId = dataGridId;
        /* --- */
        this.addEventListener("click", (event) => {
            event.stopPropagation();
            if (this.sortable) {
                const ev = new Event("sort", {bubbles:true});
                ev.data = {
                    columnName: this.columnName
                };
                this.dispatchEvent(ev);
            }
        });
    }

    get dataGridId() {
        return this.#dataGridId;
    }

    set columnName(val) {
        this.setAttribute("col-name", val);
    }

    get columnName() {
        return this.getAttribute("col-name");
    }

    set sortable(val) {
        this.setBooleanAttribute("sortable", val);
    }

    get sortable() {
        return this.getBooleanAttribute("sortable");
    }

    set sortDirection(val) {
        this.setStringAttribute("sortdir", val);
    }

    get sortDirection() {
        return this.setStringAttribute("sortdir");
    }

    static get observedAttributes() {
        return ["col-name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "col-name": {
                    const escapedColumnName = this.columnName.replace(/\./g, "\\.");
                    const styleWidth = `var(--width-${escapedColumnName}, 100%)`;
                    this.style.maxWidth = styleWidth;
                    this.style.minWidth = styleWidth;
                    this.style.width = styleWidth;
                } break;
            }
        }
    }

}

customElements.define("emc-datagrid-headercell", DataGridHeaderCell);
