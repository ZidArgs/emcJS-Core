import CustomElement from "../../element/CustomElement.js";
import {isEqual} from "../../../util/helper/Comparator.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {appUID} from "../../../util/helper/UniqueGenerator.js";
import {debounce} from "../../../util/Debouncer.js";
import {getAllAttributes} from "../../../util/helper/ui/NodeAttributes.js";
import {filterInPlace} from "../../../util/helper/collection/ArrayMutations.js";
import MutationObserverManager from "../../../util/observer/manager/MutationObserverManager.js";
import DataRecieverMixin from "../../../util/dataprovider/DataRecieverMixin.js";
import HeaderManager from "./manager/HeaderManager.js";
import RowManager from "./manager/RowManager.js";
import Column from "./Column.js";
import DataGridCell from "./components/cell/DataGridCell.js";
import CellCache from "./data/CellCache.js";
import BusyIndicator from "../../BusyIndicator.js";
import StickyObserver from "../../../util/observer/StickyObserver.js";
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
/*
TODO add DataGrid context to handle selection
- store active keys
- handle select/deselect on active keys
- row checkboxes get value from context
- select(key)
- unselect(key)
- selectAll()
- unselectAll()
- setSelected(keyList)
- isSelected(key)
- hasSelected()
- hasUnselected()
*/
export default class DataGrid extends DataRecieverMixin(CustomElement) {

    #internalId = appUID("data-grid");

    #cellCache = new CellCache();

    #scrollContainerEl;

    #tableEl;

    #headEl;

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

    #leftFixes = [];

    #rightFixes = [];

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
        this.#headerSelectEl.name = "multiselect";
        this.#headerSelectEl.addEventListener("change", (event) => {
            event.stopPropagation();
            const value = this.#headerSelectEl.checked;
            const changedKeys = this.#rowManager.setAllVisibleRowsSelected(value);
            for (const rowKey of changedKeys) {
                if (value) {
                    this.#selected.add(rowKey);
                } else {
                    this.#selected.delete(rowKey);
                }
            }
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        }, {passive: true});
        /* --- */
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#tableEl = this.shadowRoot.getElementById("table");
        this.#headEl = this.shadowRoot.getElementById("head");
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
        const stickyObserver = new StickyObserver((entries) => {
            for (const entry of entries) {
                const observedEl = entry.target;
                observedEl.classList.toggle("stuck", entry.isStuck);
            }
        }, {root: this.#scrollContainerEl});
        this.#headerManager = new HeaderManager(this.#headerEl, stickyObserver, this.#headerSelectEl, this.#internalId);
        this.#headerManager.addEventListener("afterrender", debounce(() => {
            this.#calculateCellFixes(this.#headEl);
        }));
        this.#rowManager = new RowManager(this.#bodyEl, stickyObserver, this.#cellCache, this.#internalId);
        this.#rowManager.addEventListener("afterrender", debounce(() => {
            this.#refreshEmptyStatus();
            this.#updateSelectionAfterRender();
            this.#applyCellFixes(this.#bodyEl);
        }));
        this.#rowManager.addEventListener("sort-change", (event) => {
            event.stopPropagation();
            const {
                newOrder, oldOrder
            } = event;
            const ev = new Event("sort-change");
            ev.newOrder = newOrder;
            ev.oldOrder = oldOrder;
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
                if (value) {
                    const oldrowKey = [...this.#selected][0];
                    this.#rowManager.setRowSelected(oldrowKey, false);
                    this.#selected.clear();
                    this.#selected.add(rowKey);
                } else if (this.allowDeselect) {
                    this.#selected.clear();
                } else {
                    const oldrowKey = [...this.#selected][0];
                    this.#rowManager.setRowSelected(oldrowKey, true);
                }
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
        /* --- */
        this.addEventListener("dragover", (e) => {
            if (this.#rowManager.isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        this.addEventListener("dragenter", (e) => {
            if (this.#rowManager.isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
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

    set sortable(value) {
        this.setBooleanAttribute("sortable", value);
    }

    get sortable() {
        return this.getBooleanAttribute("sortable");
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

    set allowDeselect(value) {
        this.setBooleanAttribute("allowdeselect", value);
    }

    get allowDeselect() {
        return this.getBooleanAttribute("allowdeselect");
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

    /**
     * Deactivate caching for row data and their html elements.
     * Setting this impacts render performance.
     */
    set noCache(val) {
        this.setBooleanAttribute("nocache", val);
    }

    get noCache() {
        return this.getBooleanAttribute("nocache");
    }

    static get observedAttributes() {
        return ["sortable", "selectable", "selectend", "multiple", "stretched", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "sortable": {
                    const sortable = this.sortable;
                    this.#headerManager.sortable = sortable;
                    this.#rowManager.sortable = sortable;
                } break;
                case "selectable": {
                    const selectable = this.selectable;
                    this.#headerManager.selectable = selectable;
                    this.#rowManager.selectable = selectable;
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
                    this.#setStreched(newValue);
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
                    this.#rowManager.setRowSelected(entry, true);
                }
            } else if (selected.length > 0) {
                this.#selected.add(selected[0]);
                this.#rowManager.setRowSelected(selected[0], true);
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
        for (const key of this.#selected) {
            this.#rowManager.setRowSelected(key, false);
        }
        this.#selected.clear();
        if (this.selectable) {
            const ev = new Event("selection");
            ev.data = [];
            this.dispatchEvent(ev);
        }
    }

    selectAll() {
        if (this.selectable) {
            if (this.multiple) {
                const changedKeys = this.#rowManager.setAllVisibleRowsSelected(true);
                for (const rowKey of changedKeys) {
                    this.#selected.add(rowKey);
                }
            } else {
                const selectEl = this.shadowRoot.querySelector(`td.select-cell input[type="checkbox"]`);
                const rowKey = selectEl.getAttribute("row-key");
                this.#rowManager.setRowSelected(true);
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
        await this.#busyIndicator.busy();
        if (rows != null && !Array.isArray(rows)) {
            throw new TypeError("Data must be an array or null");
        }
        if (!isEqual(this.#data, rows)) {
            if (rows == null) {
                this.#data = [];
                this.#rowManager.purge();
            } else {
                this.#data = deepClone(rows);
                this.#rowManager.manage(this.#data, this.#columnDefinition, this.#selected, this.noCache);
            }
            this.#onRowUpdate();
            /* --- */
        }
        this.#updateSelectHeader();
        await this.#busyIndicator.unbusy();
    }

    #onRowUpdate = debounce(() => {
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
        await this.#busyIndicator.busy();
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
                const {
                    name, type, width
                } = definition;
                this.style.setProperty(`--min-width-${name}`, `${width}px`);
                if (name !== this.stretched) {
                    const widthValue = width;
                    const styleWidth = getStyleLengthValue(type, widthValue);
                    this.style.setProperty(`--width-${name}`, `${styleWidth}px`);
                }
            }
            /* --- */
            const ev = new Event("rows-updated");
            this.dispatchEvent(ev);
        }
        /* --- */
        const hasColumnDefinition = newColumnDefinition.length > 0;
        this.#nocolumnsContainerEl.classList.toggle("hidden", hasColumnDefinition);
        if (hasColumnDefinition) {
            this.#refreshEmptyStatus();
        }
        /* --- */
        await this.#busyIndicator.unbusy();
    }

    #updateSelectHeader() {
        const {
            visibleCount, selectedCount
        } = this.#rowManager.getSelectionStatus();

        const ev = new Event("selection-header");
        if (selectedCount === 0) { // none selected
            this.#headerSelectEl.checked = false;
            this.#headerSelectEl.indeterminate = false;
            ev.checked = false;
            ev.indeterminate = false;
        } else if (selectedCount === visibleCount) { // all selected
            this.#headerSelectEl.checked = true;
            this.#headerSelectEl.indeterminate = false;
            ev.checked = true;
            ev.indeterminate = false;
        } else { // some selected
            this.#headerSelectEl.checked = true;
            this.#headerSelectEl.indeterminate = true;
            ev.checked = true;
            ev.indeterminate = true;
        }
        this.dispatchEvent(ev);
    }

    #onSlotChange = debounce(() => {
        this.#applyColumnDefinition();
    });

    busy() {
        return this.#busyIndicator.busy();
    }

    unbusy() {
        return this.#busyIndicator.unbusy();
    }

    reset() {
        return this.#busyIndicator.reset();
    }

    #setStreched(strechedName) {
        if (this.#stretched != null) {
            const name = this.#stretched.name;
            const widthValue = this.#stretched.width;
            if (widthValue != null) {
                const styleWidth = getStyleLengthValue(this.#stretched.type, widthValue);
                this.style.setProperty(`--width-${name}`, `${styleWidth}px`);
            }
        }
        this.#stretched = this.#columnDefinition.find((definition) => definition.name === strechedName);
        if (this.#stretched != null) {
            this.style.setProperty(`--width-${strechedName}`, "100%");
        }
    }

    #updateSelectionAfterRender() {
        this.#rowManager.setAllVisibleRowsSelected((key) => this.#selected.has(key));
    }

    #calculateCellFixes(containerEl) {
        const rowEl = containerEl.querySelector(":scope tr");
        containerEl.style.display = "table-header-group";
        this.#leftFixes = [];
        this.#rightFixes = [];
        // left cells
        {
            const fixedLeftCells = [...rowEl.querySelectorAll(":scope .fixed-cell.fixed-cell-start")];
            let leftOffset = 0;
            for (const cellEl of fixedLeftCells) {
                const stuck = cellEl.classList.contains("stuck");
                cellEl.classList.remove("stuck");
                this.#leftFixes.push(leftOffset);
                const cellWidth = cellEl.offsetWidth;
                leftOffset += cellWidth;
                cellEl.classList.toggle("stuck", stuck);
            }
        }
        // right cells
        {
            const fixedRightCells = [...rowEl.querySelectorAll(":scope .fixed-cell.fixed-cell-end")].reverse();
            let rightOffset = 0;
            for (const cellEl of fixedRightCells) {
                const stuck = cellEl.classList.contains("stuck");
                cellEl.classList.remove("stuck");
                this.#rightFixes.push(rightOffset);
                const cellWidth = cellEl.offsetWidth;
                rightOffset += cellWidth;
                cellEl.classList.toggle("stuck", stuck);
            }
        }
        // apply cell fixes
        containerEl.style.display = "";
        this.#applyCellFixes(containerEl);
    }

    #applyCellFixes(containerEl) {
        const rowEls = containerEl.querySelectorAll(":scope tr");
        for (const rowEl of rowEls) {
            // left cells
            {
                const fixedLeftCells = [...rowEl.querySelectorAll(":scope .fixed-cell.fixed-cell-start")];
                let index = 0;
                for (const cellEl of fixedLeftCells) {
                    const leftOffset = this.#leftFixes[index++];
                    cellEl.style.left = `${leftOffset}px`;
                }
            }
            // right cells
            {
                const fixedRightCells = [...rowEl.querySelectorAll(":scope .fixed-cell.fixed-cell-end")].reverse();
                let index = 0;
                for (const cellEl of fixedRightCells) {
                    const rightOffset = this.#rightFixes[index++];
                    cellEl.style.right = `${rightOffset}px`;
                }
            }
        }
    }

    #refreshEmptyStatus = debounce(() => {
        if (this.#busyIndicator.isBusy()) {
            this.#refreshEmptyStatus();
        } else {
            const isEmpty = this.#bodyEl.children.length === 0;
            this.#emptyContainerEl.classList.toggle("hidden", !isEmpty);
        }
    }, 1000);

}

customElements.define("emc-datagrid", DataGrid);
