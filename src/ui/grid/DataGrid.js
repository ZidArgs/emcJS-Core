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
import MutationObserverManager from "../../util/observer/MutationObserverManager.js";
import HeaderManager from "../../util/grid/manager/HeaderManager.js";
import RowManager from "../../util/grid/manager/RowManager.js";
import ResizeObserverMixin from "../mixin/ResizeObserverMixin.js";
import Column from "./Column.js";
import DataGridCell from "./cell/DataGridCell.js";
import "./cell/button/DataGridCellButton.js";
import "./cell/boolean/DataGridCellBoolean.js";
import "./cell/string/DataGridCellString.js";
import "./cell/number/DataGridCellNumber.js";
import "./cell/image/DataGridCellImage.js";
import "./cell/i18n/DataGridCellI18n.js";
import "./cell/boolorlogic/DataGridCellBoolOrLogic.js";
import "./cell/date/DataGridCellDate.js";
import "./cell/datetime/DataGridCellDateTime.js";
import "./cell/time/DataGridCellTime.js";
import "./cell/relation/DataGridCellRelation.js";
import TPL from "./DataGrid.js.html" assert {type: "html"};
import STYLE from "./DataGrid.js.css" assert {type: "css"};

const MUTATION_CONFIG = {
    attributes: true
};

const PX_REGEXP = /^[0-9]+(?:\.[0-9]+)?$/;

function getStyleLengthValue(value, type) {
    const minValue = DataGridCell.getTypeMinWidth(type);
    if (PX_REGEXP.test(value)) {
        return Math.max(parseFloat(value), minValue, 50);
    }
    if (minValue != null) {
        return Math.max(minValue, 50);
    }
    return 200;
}

export default class DataGrid extends ResizeObserverMixin(CustomElement) {

    #tableEl;

    #headerEl;

    #bodyEl;

    #emptyEl;

    #columnContainerEl;

    #columnDefinition = [];

    #data = [];

    #headerManager;

    #rowManager;

    #headerSelectEl;

    #selected = new Set();

    #stretched = null;

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#headerSelectEl = document.createElement("input");
        this.#headerSelectEl.type = "checkbox";
        this.#headerSelectEl.addEventListener("change", () => {
            const value = this.#headerSelectEl.checked;
            const selectEls = this.shadowRoot.querySelectorAll(`td.select-cell input[type="checkbox"]`);
            for (const selectEl of selectEls) {
                selectEl.checked = value;
                const rowName = selectEl.getAttribute("row-name");
                if (value) {
                    this.#selected.add(rowName);
                } else {
                    this.#selected.delete(rowName);
                }
            }
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        });
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
        this.#headerManager = new HeaderManager(this.#headerEl, this.#headerSelectEl);
        this.#rowManager = new RowManager(this.#bodyEl);
        /* --- */
        this.#tableEl.addEventListener("action", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {action, columnName, rowName} = event.data;
            if (action == null) {
                return;
            }
            const ev = new Event(`action::${action}`);
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
            if (action == null) {
                return;
            }
            const ev = new Event(`edit::${action}`);
            ev.data = {
                value,
                columnName,
                rowName
            };
            this.dispatchEvent(ev);
        });
        this.#tableEl.addEventListener("selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            if (this.selectable === "single") {
                const oldRowName = [...this.#selected][0];
                const selectEl = this.shadowRoot.querySelectorAll(`.select-cell input[type="checkbox"][row-name="${oldRowName}"]`);
                if (selectEl != null) {
                    selectEl.checked = false;
                }
                this.#selected.clear();
                this.#selected.add(rowName);
            } else if (value) {
                this.#selected.add(rowName);
            } else {
                this.#selected.delete(rowName);
            }
            this.#updateSelectHeader();
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.#stretched = this.#columnDefinition.find((definition) => definition.name === this.stretched);
    }

    set nohead(value) {
        this.setBooleanAttribute("nohead", value);
    }

    get nohead() {
        return this.getBooleanAttribute("nohead");
    }

    set selectable(value) {
        this.setAttribute("selectable", value);
    }

    get selectable() {
        return this.getAttribute("selectable");
    }

    set stretched(value) {
        this.setAttribute("stretched", value);
    }

    get stretched() {
        return this.getAttribute("stretched");
    }

    static get observedAttributes() {
        return ["selectable", "stretched"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "selectable": {
                    if (newValue == null || newValue === "false" || newValue === "single" || oldValue === "single") {
                        this.clearSelected()
                    }
                } break;
                case "stretched": {
                    if (this.#stretched != null) {
                        const name = this.#stretched.name;
                        const widthValue = this.#stretched.width;
                        if (widthValue != null) {
                            const styleWidth = getStyleLengthValue(widthValue);
                            this.style.setProperty(`--width-${name}`, `${styleWidth}px`);
                        }
                    }
                    this.#stretched = this.#columnDefinition.find((definition) => definition.name === newValue);
                    this.resizeCallback();
                } break;
            }
        }
    }

    setSelected(selected) {
        if (this.selectable != null && this.selectable !== "false") {
            this.#selected.clear();
            if (this.selectable !== "single") {
                for (const entry of selected) {
                    this.#selected.add(entry);
                }
            } else {
                this.#selected.add(selected[0]);
            }
            const selectEls = this.shadowRoot.querySelectorAll(`.select-cell input[type="checkbox"]`);
            for (const selectEl of selectEls) {
                selectEl.checked = this.#selected.has(selectEl.getAttribute("row-name"));
            }
            this.#updateSelectHeader();
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        }
    }

    getSelected() {
        return [...this.#selected].sort();
    }

    clearSelected() {
        this.#selected.clear();
        const selectEls = this.shadowRoot.querySelectorAll(`.select-cell input[type="checkbox"]`);
        for (const selectEl of selectEls) {
            selectEl.checked = false;
        }
        if (this.selectable != null && this.selectable !== "false") {
            const ev = new Event("selection");
            ev.data = [];
            this.dispatchEvent(ev);
        }
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
                this.#rowManager.manage(this.#data, this.#columnDefinition, this.#selected);
                if (this.#bodyEl.childNodes.length > 0) {
                    this.#emptyEl.classList.add("hidden");
                }
            }
            /* --- */
            const ev = new Event("rows-updated");
            this.dispatchEvent(ev);
        }
        this.#updateSelectHeader();
    }

    getAllCellsForColumn(name) {
        return this.#bodyEl.querySelectorAll(`tr > [col-name="${name}"]`);
    }

    #applyColumnDefinition() {
        const columnNodeList = this.#columnContainerEl.assignedElements({flatten: true}).filter((el) => el instanceof Column);
        const newColumnDefinition = [];
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();

        for (const columnEl of columnNodeList) {
            const columnData = getAllAttributes(columnEl);
            newColumnDefinition.push(columnData);
            if (oldNodes.has(columnEl)) {
                oldNodes.delete(columnEl);
            } else {
                newNodes.add(columnEl);
            }
        }
        for (const node of oldNodes) {
            this.#mutationObserver.unobserve(node);
        }
        for (const node of newNodes) {
            this.#mutationObserver.observe(node);
        }

        if (!isEqual(this.#columnDefinition, newColumnDefinition)) {
            this.#columnDefinition = newColumnDefinition;
            this.#headerManager.manage(newColumnDefinition);
            this.#rowManager.manage(this.#data, newColumnDefinition);
            /* --- */
            for (const definition of newColumnDefinition) {
                if (definition.name === this.stretched) {
                    this.#stretched = definition;
                } else {
                    const widthValue = definition.width;
                    const styleWidth = getStyleLengthValue(widthValue ?? 200, definition.type);
                    this.style.setProperty(`--width-${definition.name}`, `${styleWidth}px`);
                }
            }
            this.resizeCallback();
            /* --- */
            const ev = new Event("rows-updated");
            this.dispatchEvent(ev);
        }
    }

    #updateSelectHeader() {
        let value = 0;
        const selectEls = this.shadowRoot.querySelectorAll(`td.select-cell input[type="checkbox"]`);
        for (const selectEl of selectEls) {
            value |= selectEl.checked ? 2 : 1;
        }
        if (value === 2) {
            this.#headerSelectEl.checked = true;
            this.#headerSelectEl.indeterminate = false;
        } else if (value === 3) {
            this.#headerSelectEl.checked = true;
            this.#headerSelectEl.indeterminate = true;
        } else {
            this.#headerSelectEl.checked = false;
            this.#headerSelectEl.indeterminate = false;
        }
    }

    #onSlotChange = debounce(() => {
        this.#applyColumnDefinition();
    });

    resizeCallback() {
        if (this.#stretched != null) {
            const gridWidth = this.clientWidth;
            const name = this.#stretched.name;
            let diff = 0;
            for (const def of this.#columnDefinition) {
                if (def !== this.#stretched) {
                    if (def.width != null) {
                        diff += getStyleLengthValue(def.width, def.type);
                    } else {
                        diff += 200;
                    }
                }
            }
            if (this.selectable != null && this.selectable !== false) {
                diff += 40;
            }
            let resultWidth = gridWidth - diff;
            const widthValue = this.#stretched.width;
            if (widthValue != null) {
                resultWidth = Math.max(resultWidth, parseFloat(widthValue) || 0);
            }
            const styleWidth = getStyleLengthValue(resultWidth, this.#stretched.type);
            this.style.setProperty(`--width-${name}`, `${styleWidth}px`);
        }
    }

}

customElements.define("emc-grid-datagrid", DataGrid);
