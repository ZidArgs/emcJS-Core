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
import CellManager from "./CellManager.js";

export default class RowManager {

    #dataGridId;

    #target;

    #elements = new Map();

    #order = [];

    #rowDataCache = new Map();

    #cachedColumnDefinition;

    #cellManagers = new Map();

    constructor(target, dataGridId) {
        if (!(target instanceof HTMLTableSectionElement)) {
            throw new TypeError("target must be of type HTMLTableSectionElement");
        }
        this.#dataGridId = dataGridId;
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
            const name = rowData.name;
            const isSelected = selectedRows?.has(name) ?? false;
            if (typeof name !== "string") {
                throw new TypeError("row name must be a string");
            }

            newOrder.push(name);

            if (!this.#elements.has(name)) {
                const rowEl = this.composer(name, columnDefinition, rowData, isSelected);
                if (rowEl != null) {
                    rowEl.setAttribute("row-name", name);
                    this.mutator(rowEl, name, columnDefinition, rowData, isSelected);
                    this.#elements.set(name, rowEl);
                }
                this.#cachedColumnDefinition = deepClone(columnDefinition);
                this.#rowDataCache.set(name, deepClone(rowData));
            } else {
                const rowEl = this.#elements.get(name);
                if (columnDataChanged || this.#checkRowDataChange(name, rowData)) {
                    this.mutator(rowEl, name, columnDefinition, rowData, isSelected);
                }
                unused.delete(name);
            }
        }

        for (const name of unused) {
            const rowEl = this.#elements.get(name);
            rowEl.remove();
            this.#elements.delete(name);
            this.#rowDataCache.delete(name);
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

    #checkRowDataChange(name, rowData) {
        if (typeof name !== "string") {
            return true;
        }
        const cachedRowData = this.#rowDataCache.get(name);
        if (!isEqual(cachedRowData, rowData)) {
            this.#rowDataCache.set(name, deepClone(rowData));
            return true;
        }
        return false;
    }

    composer(name, columnData, rowData, isSelected) {
        const rowEl = document.createElement("tr");

        const cellManager = new CellManager(rowEl, this.#dataGridId);
        this.#cellManagers.set(name, cellManager);
        cellManager.manage(columnData, rowData, isSelected);

        return rowEl;
    }

    mutator(rowEl, name, columnData, rowData, isSelected) {
        const cellManager = this.#cellManagers.get(name);
        cellManager.manage(columnData, rowData, isSelected);
    }

    #render = debounce(() => {
        const children = this.#target.children;
        if (children.length > 0) {
            const currentOrder = [...children].map((el) => el.getAttribute("row-name") ?? "");
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
