import {
    debounce
} from "../../../util/Debouncer.js";
import {
    isEqual
} from "../../../util/helper/Comparator.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import {
    getArrayMutations
} from "../../../util/helper/collection/ArrayMutations.js";
import CellCache from "../data/CellCache.js";
import CellManager from "./CellManager.js";

export default class RowManager {

    #dataGridId;

    #cellCache;

    #target;

    #elements = new Map();

    #order = [];

    #rowDataCache = new Map();

    #cachedColumnDefinition;

    #cellManagers = new Map();

    constructor(target, cellCache, dataGridId) {
        if (!(target instanceof HTMLTableSectionElement)) {
            throw new TypeError("target must be of type HTMLTableSectionElement");
        }
        if (!(cellCache instanceof CellCache)) {
            throw new TypeError("cellCache must be of type CellCache");
        }
        this.#dataGridId = dataGridId;
        this.#cellCache = cellCache;
        this.#target = target;
    }

    purge() {
        this.#target.innerHTML = "";
        this.#order = [];
        this.#elements.clear();
        this.#rowDataCache.clear();
        this.#cellManagers.clear();
    }

    manage(rowDataList, columnDefinition, selectedRows) {
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
                const rowEl = this.composer(key, columnDefinition, rowData, isSelected);
                if (rowEl != null) {
                    rowEl.setAttribute("row-key", key);
                    this.mutator(rowEl, key, columnDefinition, rowData, isSelected);
                    this.#elements.set(key, rowEl);
                }
                this.#cachedColumnDefinition = deepClone(columnDefinition);
                this.#rowDataCache.set(key, deepClone(rowData));
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
            this.#cellCache.removeRow(key);
            this.#rowDataCache.delete(key);
        }

        if (!isEqual(newOrder, this.#order)) {
            this.#order = newOrder;
            this.#render();
        }
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

    composer(key, columnData, rowData, isSelected) {
        const rowEl = document.createElement("tr");

        const cellManager = new CellManager(rowEl, this.#cellCache, this.#dataGridId);
        this.#cellManagers.set(key, cellManager);
        cellManager.manage(columnData, rowData, isSelected);

        return rowEl;
    }

    mutator(rowEl, key, columnData, rowData, isSelected) {
        const cellManager = this.#cellManagers.get(key);
        cellManager.manage(columnData, rowData, isSelected);
    }

    #render = debounce(() => {
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
            for (const {sequence, position} of changes) {
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
    });

}
