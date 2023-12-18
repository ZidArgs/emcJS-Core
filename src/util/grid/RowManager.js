import {
    isEqual
} from "../helper/Comparator.js";
import {
    deepClone
} from "../helper/DeepClone.js";
import CellManager from "./CellManager.js";

export default class RowManager {

    #target;

    #elements = new Map();

    #order = [];

    #rowDataCache = new Map();

    #cachedColumnDefinition;

    #cellManagers = new Map();

    constructor(target) {
        if (!(target instanceof HTMLTableSectionElement)) {
            throw new TypeError("target must be of type HTMLTableSectionElement");
        }
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
        const changes = {added: [], updated: [], deleted: [], moved: []};
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

            const oldIndex = this.#order.indexOf(name);
            if (oldIndex > 0 && oldIndex !== index) {
                changes.moved.push(name);
            }
            newOrder.push(name);

            if (!this.#elements.has(name)) {
                const rowEl = this.composer(name, columnDefinition, rowData, isSelected);
                if (rowEl != null) {
                    rowEl.setAttribute("row-name", name);
                    this.mutator(rowEl, name, columnDefinition, rowData, isSelected);
                    this.#elements.set(name, rowEl);
                    changes.added.push(name);
                    this.#target.append(rowEl);
                }
                this.#cachedColumnDefinition = deepClone(columnDefinition);
                this.#rowDataCache.set(name, deepClone(rowData));
            } else {
                const rowEl = this.#elements.get(name);
                if (columnDataChanged || this.#checkRowDataChange(name, rowData)) {
                    this.mutator(rowEl, name, columnDefinition, rowData, isSelected);
                    changes.updated.push(name);
                }
                unused.delete(name);
                this.#target.append(rowEl);
            }
        }
        this.#order = newOrder;

        for (const name of unused) {
            const rowEl = this.#elements.get(name);
            rowEl.remove();
            this.#elements.delete(name);
            this.#rowDataCache.delete(name);
            changes.deleted.push(name);
        }

        return changes;
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

        const cellManager = new CellManager(rowEl);
        this.#cellManagers.set(name, cellManager);
        cellManager.manage(columnData, rowData, isSelected);

        return rowEl;
    }

    mutator(rowEl, name, columnData, rowData, isSelected) {
        const cellManager = this.#cellManagers.get(name);
        cellManager.manage(columnData, rowData, isSelected);
    }

}
