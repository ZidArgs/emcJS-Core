import {debounce} from "../../../../util/Debouncer.js";
import {isEqual} from "../../../../util/helper/Comparator.js";
import {deepClone} from "../../../../util/helper/DeepClone.js";
import {getArrayMutations} from "../../../../util/helper/collection/ArrayMutations.js";
import CellCache from "../data/CellCache.js";
import CellManager from "./CellManager.js";

const DRAG_PREVIEW = document.createElement("div");
DRAG_PREVIEW.style.display = "none";
document.body.append(DRAG_PREVIEW);

export default class RowManager extends EventTarget {

    #dataGridId;

    #cellCache;

    #target;

    #stickyObserver;

    #elements = new Map();

    #elementCache = new Map();

    #order = [];

    #rowDataCache = new Map();

    #cachedColumnDefinition;

    #cellManagers = new Map();

    #sortable = false;

    #selectable = false;

    #selectEnd = false;

    constructor(target, stickyObserver, cellCache, dataGridId) {
        if (!(target instanceof HTMLTableSectionElement)) {
            throw new TypeError("target must be of type HTMLTableSectionElement");
        }
        if (!(cellCache instanceof CellCache)) {
            throw new TypeError("cellCache must be of type CellCache");
        }
        super();
        this.#dataGridId = dataGridId;
        this.#cellCache = cellCache;
        this.#target = target;
        this.#stickyObserver = stickyObserver;
    }

    set sortable(value) {
        value = !!value;
        if (this.#sortable !== value) {
            this.#sortable = value;
            for (const [, manager] of this.#cellManagers) {
                manager.sortable = value;
            }
        }
    }

    get sortable() {
        return this.#sortable;
    }

    set selectable(value) {
        value = !!value;
        if (this.#selectable !== value) {
            this.#selectable = value;
            for (const [, manager] of this.#cellManagers) {
                manager.selectable = value;
            }
        }
    }

    get selectable() {
        return this.#selectable;
    }

    set selectEnd(value) {
        value = !!value;
        if (this.#selectEnd !== value) {
            this.#selectEnd = value;
            for (const [, manager] of this.#cellManagers) {
                manager.selectEnd = value;
            }
        }
    }

    get selectEnd() {
        return this.#selectEnd;
    }

    purge() {
        this.#target.innerHTML = "";
        this.#order = [];
        this.#elements.clear();
        this.#elementCache.clear();
        this.#rowDataCache.clear();
        this.#cellManagers.clear();
    }

    manage(rowDataList, columnDefinition, selectedRows, noCache = false) {
        if (!Array.isArray(rowDataList)) {
            throw new TypeError("data must be an array");
        }

        const columnDataChanged = this.#checkColumnDefinitionChange(columnDefinition);
        const unused = new Set(this.#elements.keys());
        const newOrder = [];

        for (const index in rowDataList) {
            const rowData = rowDataList[index];
            if (typeof rowData !== "object" || Array.isArray(rowData)) {
                throw new TypeError("data entries must be objects");
            }
            const key = rowData.key;
            const isSelected = selectedRows?.has(key) ?? false;
            if (typeof key !== "string") {
                throw new TypeError("row key must be a string");
            }

            newOrder.push(key);

            if (!this.#elements.has(key)) {
                const rowEl = this.#getOrCreateElement(key);
                this.#elements.set(key, rowEl);
                if (columnDataChanged || this.#checkRowDataChange(key, rowData)) {
                    this.mutator(rowEl, key, columnDefinition, rowData, isSelected);
                }
            } else {
                const rowEl = this.#elements.get(key);
                if (columnDataChanged || this.#checkRowDataChange(key, rowData)) {
                    this.mutator(rowEl, key, columnDefinition, rowData, isSelected);
                }
                unused.delete(key);
            }
        }

        for (const key of unused) {
            const rowEl = this.#elements.get(key);
            rowEl.remove();
            this.#elements.delete(key);
            if (noCache) {
                this.#elementCache.delete(key);
                this.#rowDataCache.delete(key);
                this.#cellManagers.delete(key);
            }
        }

        if (!isEqual(newOrder, this.#order)) {
            this.#order = newOrder;
            this.#render();
        }
    }

    #getOrCreateElement(key) {
        if (this.#elementCache.has(key)) {
            return this.#elementCache.get(key);
        }
        const rowEl = this.composer(key);
        rowEl.setAttribute("row-key", key);
        this.#elementCache.set(key, rowEl);
        return rowEl;
    }

    #checkColumnDefinitionChange(columnDefinition) {
        if (this.#cachedColumnDefinition == null || !isEqual(this.#cachedColumnDefinition, columnDefinition)) {
            this.#cachedColumnDefinition = deepClone(columnDefinition);
            return true;
        }
        return false;
    }

    #checkRowDataChange(key, rowData) {
        if (typeof key !== "string") {
            return true;
        }
        const cachedRowData = this.#rowDataCache.get(key);
        if (!isEqual(cachedRowData, rowData)) {
            this.#rowDataCache.set(key, deepClone(rowData));
            return true;
        }
        return false;
    }

    composer(key) {
        const rowEl = document.createElement("tr");
        rowEl.addEventListener("dragstart", (event) => {
            rowEl.classList.add("dragging");
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setDragImage(DRAG_PREVIEW, 0, 0);
        });
        rowEl.addEventListener("dragend", () => {
            rowEl.classList.remove("dragging");
        });

        const cellManager = new CellManager(rowEl, this.#stickyObserver, this.#cellCache, this.#dataGridId);
        cellManager.sortable = this.#sortable;
        cellManager.selectable = this.#selectable;
        cellManager.selectEnd = this.#selectEnd;
        cellManager.addEventListener("beforerender", () => {
            this.dispatchEvent(new Event("beforerender"));
        });
        cellManager.addEventListener("afterrender", () => {
            this.dispatchEvent(new Event("afterrender"));
        });
        this.#cellManagers.set(key, cellManager);

        return rowEl;
    }

    mutator(rowEl, key, columnData, rowData, isSelected) {
        const cellManager = this.#cellManagers.get(key);
        cellManager.manage(columnData, rowData, isSelected);
    }

    #render = debounce(() => {
        this.dispatchEvent(new Event("beforerender"));
        const children = this.#target.children;
        if (children.length > 0) {
            const currentOrder = [...children].map((el) => el.getAttribute("row-key") ?? "");
            const keys = [...this.#order];
            const {changes} = getArrayMutations(currentOrder, keys);
            for (const {sequence} of changes) {
                for (const key of sequence) {
                    const el = this.#elements.get(key);
                    if (el != null) {
                        el.remove();
                    }
                }
            }
            for (const change of changes) {
                const {
                    sequence, position
                } = change;
                const els = [];
                for (const key of sequence) {
                    const el = this.#elements.get(key);
                    if (el != null) {
                        els.push(el);
                    }
                }
                if (position === 0) {
                    this.#target.prepend(...els);
                } else {
                    this.#target.children[position - 1].after(...els);
                }
            }
        } else {
            const els = [];
            for (const key of this.#order) {
                const el = this.#elements.get(key);
                if (el != null) {
                    els.push(el);
                }
            }
            this.#target.append(...els);
        }
        this.dispatchEvent(new Event("afterrender"));
    });

}
