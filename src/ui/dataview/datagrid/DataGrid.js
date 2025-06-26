import CustomElement from "../../element/CustomElement.js";
import {isEqual} from "../../../util/helper/Comparator.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {appUID} from "../../../util/helper/UniqueGenerator.js";
import {debounce} from "../../../util/Debouncer.js";
import {getAllAttributes} from "../../../util/helper/ui/NodeAttributes.js";
import {filterInPlace} from "../../../util/helper/collection/ArrayMutations.js";
import BusyIndicatorManager from "../../../util/BusyIndicatorManager.js";
import MutationObserverManager from "../../../util/observer/MutationObserverManager.js";
import DataRecieverMixin from "../../../util/dataprovider/DataRecieverMixin.js";
import HeaderManager from "./manager/HeaderManager.js";
import RowManager from "./manager/RowManager.js";
import ResizeObserverMixin from "../../mixin/ResizeObserverMixin.js";
import Column from "./Column.js";
import DataGridCell from "./components/cell/DataGridCell.js";
import CellCache from "./data/CellCache.js";
import BusyIndicator from "../../BusyIndicator.js";
import "../../i18n/I18nLabel.js";
import "./components/CellTypeLoader.js";
import TPL from "./DataGrid.js.html" assert {type: "html"};
import STYLE from "./DataGrid.js.css" assert {type: "css"};

const MUTATION_CONFIG = {attributes: true};

const PX_REGEXP = /^[0-9]+(?:\.[0-9]+)?$/;

function getStyleLengthValue(type, value) {
    const minValue = DataGridCell.getTypeMinWidth(type);
    if (value != null && PX_REGEXP.test(value)) {
        return Math.max(parseFloat(value), minValue, 50);
    }
    if (minValue != null) {
        return Math.max(minValue, 50);
    }
    return 200;
}

// TODO add "no match" label
export default class DataGrid extends ResizeObserverMixin(DataRecieverMixin(CustomElement)) {

    #internalId = appUID("data-grid");

    #cellCache = new CellCache();

    #tableEl;

    #headerEl;

    #bodyEl;

    #nocolumnsContainerEl;

    #emptyContainerEl;

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

    #busyIndicator = new BusyIndicator();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#busyIndicator.setTarget(this.shadowRoot);
        /* --- */
        this.#headerSelectEl = document.createElement("input");
        this.#headerSelectEl.type = "checkbox";
        this.#headerSelectEl.addEventListener("change", () => {
            const value = this.#headerSelectEl.checked;
            const selectEls = this.shadowRoot.querySelectorAll(`td.select-cell input[type="checkbox"]`);
            for (const selectEl of selectEls) {
                selectEl.checked = value;
                const rowKey = selectEl.getAttribute("row-key");
                if (value) {
                    this.#selected.add(rowKey);
                } else {
                    this.#selected.delete(rowKey);
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
        this.#nocolumnsContainerEl = this.shadowRoot.getElementById("nocolumns-container");
        this.#emptyContainerEl = this.shadowRoot.getElementById("empty-container");
        /* --- */
        this.#columnContainerEl = this.shadowRoot.getElementById("column-container");
        this.#columnContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        this.#onSlotChange();
        /* --- */
        this.#headerManager = new HeaderManager(this.#headerEl, this.#headerSelectEl, this.#internalId);
        this.#rowManager = new RowManager(this.#bodyEl, this.#cellCache, this.#internalId);
        this.#rowManager.addEventListener("afterrender", () => {
            this.#emptyContainerEl.classList.toggle("hidden", this.#bodyEl.childNodes.length > 0);
        });
        /* --- */
        this.#tableEl.addEventListener("move-row-up", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const ev = new Event("move-row-up");
            ev.data = {rowKey};
            this.dispatchEvent(ev);
        });
        this.#tableEl.addEventListener("move-row-down", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const ev = new Event("move-row-down");
            ev.data = {rowKey};
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#tableEl.addEventListener("menu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, columnName, rowKey
            } = event.data;
            const ev = new PointerEvent("menu", event);
            ev.data = {
                value,
                columnName,
                rowKey,
                source: event.srcElement
            };
            this.dispatchEvent(ev);
        });
        this.#tableEl.addEventListener("action", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                action, columnName, rowKey
            } = event.data;
            if (action == null || typeof action !== "string" || action === "") {
                const ev = new Event("action");
                ev.data = {
                    columnName,
                    rowKey,
                    source: event.srcElement
                };
                this.dispatchEvent(ev);
            } else {
                const ev = new Event(`action::${action}`);
                ev.data = {
                    columnName,
                    rowKey,
                    source: event.srcElement
                };
                this.dispatchEvent(ev);
            }
        });
        this.#tableEl.addEventListener("edit", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, action, columnName, rowKey
            } = event.data;
            if (action == null || typeof action !== "string" || action === "") {
                const ev = new Event("edit");
                ev.data = {
                    value,
                    columnName,
                    rowKey,
                    source: event.srcElement
                };
                this.dispatchEvent(ev);
            } else {
                const ev = new Event(`edit::${action}`);
                ev.data = {
                    value,
                    columnName,
                    rowKey,
                    source: event.srcElement
                };
                this.dispatchEvent(ev);
            }
        });
        this.#tableEl.addEventListener("selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            if (!this.multiple) {
                const oldrowKey = [...this.#selected][0];
                const selectEl = this.shadowRoot.querySelector(`.select-cell input[type="checkbox"][row-key="${oldrowKey}"]`);
                if (selectEl != null) {
                    selectEl.checked = false;
                }
                this.#selected.clear();
                this.#selected.add(rowKey);
            } else if (value) {
                this.#selected.add(rowKey);
            } else {
                this.#selected.delete(rowKey);
            }
            this.#updateSelectHeader();
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#tableEl.addEventListener("sort", (event) => {
            event.stopPropagation();
            const {columnName} = event.data;
            const ev = new Event("sort");
            ev.data = {columnName};
            this.dispatchEvent(ev);
        });
        this.#tableEl.addEventListener("unsort", (event) => {
            event.stopPropagation();
            const {columnName} = event.data;
            const ev = new Event("unsort");
            ev.data = {columnName};
            this.dispatchEvent(ev);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.#stretched = this.#columnDefinition.find((definition) => definition.name === this.stretched);
    }

    get internalId() {
        return this.#internalId;
    }

    set nohead(value) {
        this.setBooleanAttribute("nohead", value);
    }

    get nohead() {
        return this.getBooleanAttribute("nohead");
    }

    set selectable(value) {
        this.setBooleanAttribute("selectable", value);
    }

    get selectable() {
        return this.getBooleanAttribute("selectable");
    }

    set multiple(value) {
        this.setBooleanAttribute("multiple", value);
    }

    get multiple() {
        return this.getBooleanAttribute("multiple");
    }

    set selectEnd(value) {
        this.setBooleanAttribute("selectend", value);
    }

    get selectEnd() {
        return this.getBooleanAttribute("selectend");
    }

    set stretched(value) {
        this.setAttribute("stretched", value);
    }

    get stretched() {
        return this.getAttribute("stretched");
    }

    set disabled(val) {
        this.setBooleanAttribute("disabled", val);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    set readonly(val) {
        this.setBooleanAttribute("readonly", val);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    static get observedAttributes() {
        return ["selectable", "selectend", "multiple", "stretched", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "selectable": {
                    if (!this.selectable) {
                        this.clearSelected();
                    }
                } break;
                case "selectend": {
                    const selectEnd = this.selectEnd;
                    this.#headerManager.selectEnd = selectEnd;
                    this.#rowManager.selectEnd = selectEnd;
                } break;
                case "multiple": {
                    if (!this.multiple) {
                        this.clearSelected();
                    }
                } break;
                case "stretched": {
                    if (this.#stretched != null) {
                        const name = this.#stretched.name;
                        const widthValue = this.#stretched.width;
                        if (widthValue != null) {
                            const styleWidth = getStyleLengthValue(this.#stretched.type, widthValue);
                            this.style.setProperty(`--width-${name}`, `${styleWidth}px`);
                        }
                    }
                    this.#stretched = this.#columnDefinition.find((definition) => definition.name === newValue);
                    this.resizeCallback();
                } break;
                case "disabled": {
                    for (const [,, cell] of this.#cellCache.getAllCells()) {
                        cell.disabled = this.disabled;
                    }
                } break;
                case "readonly": {
                    for (const [,, cell] of this.#cellCache.getAllCells()) {
                        cell.readonly = this.readonly;
                    }
                } break;
            }
        }
    }

    setSelected(selected) {
        if (selected != null && this.selectable) {
            if (!Array.isArray(selected)) {
                if (typeof selected === "string") {
                    selected = [selected];
                } else {
                    selected = [];
                }
            }
            this.#selected.clear();
            if (this.multiple) {
                for (const entry of selected) {
                    this.#selected.add(entry);
                }
            } else if (selected.length > 0) {
                this.#selected.add(selected[0]);
            }
            const selectEls = this.shadowRoot.querySelectorAll(`.select-cell input[type="checkbox"]`);
            for (const selectEl of selectEls) {
                selectEl.checked = this.#selected.has(selectEl.getAttribute("row-key"));
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
        if (this.selectable) {
            const ev = new Event("selection");
            ev.data = [];
            this.dispatchEvent(ev);
        }
    }

    selectAll() {
        if (this.selectable) {
            this.#selected.clear();
            const selectEls = this.shadowRoot.querySelectorAll(`td.select-cell input[type="checkbox"]`);
            if (this.multiple) {
                for (const selectEl of selectEls) {
                    selectEl.checked = true;
                    const rowKey = selectEl.getAttribute("row-key");
                    this.#selected.add(rowKey);
                }
            } else {
                const selectEl = selectEls[0];
                selectEl.checked = true;
                const rowKey = selectEl.getAttribute("row-key");
                this.#selected.add(rowKey);
            }
            this.#updateSelectHeader();
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        }
    }

    setSortIndicators(columns = []) {
        const showSortOrder = columns.length > 1;
        for (const colDef of this.#columnDefinition) {
            const {name} = colDef;
            const headerCellEl = this.#headerManager.getCellByColumnName(name);
            const sortIndex = columns.findIndex((entry) => entry === name || entry === `!${name}`);
            if (sortIndex >= 0) {
                const sort = columns[sortIndex];
                headerCellEl.sortDirection = sort.startsWith("!") ? "dec" : "inc";
                if (showSortOrder) {
                    headerCellEl.sortOrder = sortIndex + 1;
                } else {
                    headerCellEl.sortOrder = null;
                }
            } else {
                headerCellEl.sortDirection = null;
                headerCellEl.sortOrder = null;
            }
        }
    }

    async setData(rows = []) {
        await BusyIndicatorManager.busy();
        if (rows != null && !Array.isArray(rows)) {
            throw new TypeError("Data must be an array or null");
        }
        if (!isEqual(this.#data, rows)) {
            if (rows == null) {
                this.#data = [];
                this.#rowManager.purge();
            } else {
                this.#data = deepClone(rows);
                this.#rowManager.manage(this.#data, this.#columnDefinition, this.#selected);
            }
            this.#notifyRowUpdate();
            /* --- */
        }
        this.#updateSelectHeader();
        await BusyIndicatorManager.unbusy();
    }

    #notifyRowUpdate = debounce(() => {
        if (this.readonly || this.disabled) {
            for (const [,, cell] of this.#cellCache.getAllCells()) {
                cell.readonly = this.readonly;
                cell.disabled = this.disabled;
            }
        }
        const ev = new Event("rows-updated");
        this.dispatchEvent(ev);
    });

    getAllCellsForColumn(colName) {
        return this.#cellCache.getAllCellsForColumn(colName);
    }

    getCell(rowKey, colName) {
        return this.#cellCache.getCell(rowKey, colName);
    }

    async #applyColumnDefinition() {
        await BusyIndicatorManager.busy();
        const columnNodeList = this.#columnContainerEl.assignedElements({flatten: true}).filter((el) => el instanceof Column);
        const newColumnDefinition = [];
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();

        for (const columnEl of columnNodeList) {
            const columnData = getAllAttributes(columnEl);

            if (columnData.hidden && columnData.hidden !== "false") {
                continue;
            }

            filterInPlace(newColumnDefinition, (entry) => {
                if (columnData.name !== entry.name) {
                    return true;
                }
                console.warn(`duplicate column definition for "${columnData.name}" in DataGrid`, this);
                return false;
            });

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
                    const styleWidth = getStyleLengthValue(definition.type, widthValue);
                    this.style.setProperty(`--width-${definition.name}`, `${styleWidth}px`);
                }
            }
            this.resizeCallback();
            /* --- */
            const ev = new Event("rows-updated");
            this.dispatchEvent(ev);
        }
        /* --- */
        this.#nocolumnsContainerEl.classList.toggle("hidden", newColumnDefinition.length > 0);
        /* --- */
        await BusyIndicatorManager.unbusy();
    }

    #updateSelectHeader() {
        let value = 0;
        const selectEls = this.shadowRoot.querySelectorAll(`td.select-cell input[type="checkbox"]`);
        for (const selectEl of selectEls) {
            value |= selectEl.checked ? 2 : 1;
        }
        const ev = new Event("selection-header");
        if (value === 2) {
            this.#headerSelectEl.checked = true;
            this.#headerSelectEl.indeterminate = false;
            ev.checked = true;
            ev.indeterminate = false;
        } else if (value === 3) {
            this.#headerSelectEl.checked = true;
            this.#headerSelectEl.indeterminate = true;
            ev.checked = true;
            ev.indeterminate = true;
        } else {
            this.#headerSelectEl.checked = false;
            this.#headerSelectEl.indeterminate = false;
            ev.checked = false;
            ev.indeterminate = false;
        }
        this.dispatchEvent(ev);
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
                        diff += getStyleLengthValue(def.type, def.width);
                    } else {
                        diff += getStyleLengthValue(def.type);
                    }
                }
            }
            if (this.selectable) {
                diff += 40;
            }
            let resultWidth = gridWidth - diff;
            const widthValue = this.#stretched.width;
            if (widthValue != null) {
                resultWidth = Math.max(resultWidth, parseFloat(widthValue) || 0);
            }
            const styleWidth = getStyleLengthValue(this.#stretched.type, resultWidth);
            this.style.setProperty(`--width-${name}`, `${styleWidth}px`);
        }
    }

    busy() {
        return this.#busyIndicator.busy();
    }

    unbusy() {
        return this.#busyIndicator.unbusy();
    }

    reset() {
        return this.#busyIndicator.reset();
    }

}

customElements.define("emc-datagrid", DataGrid);
