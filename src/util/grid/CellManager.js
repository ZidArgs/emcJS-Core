import {
    isEqual
} from "../helper/Comparator.js";
import {
    deepClone
} from "../helper/DeepClone.js";
import DataGridCell from "../../ui/grid/cell/DataGridCell.js";

export default class CellManager {

    #target;

    #elements = new Map();

    #order = [];

    #types = new Map();

    #columnDefinitionCache = new Map();

    #valueCache = new Map();

    #lastCellEl;

    constructor(target) {
        if (!(target instanceof HTMLTableRowElement)) {
            throw new TypeError("target must be of type HTMLTableRowElement");
        }
        this.#target = target;

        this.#lastCellEl = document.createElement("th")
        this.#lastCellEl.classList.add("lastCell");
    }

    purge() {
        this.#target.innerHTML = "";
        this.#order = [];
        this.#elements.clear();
        this.#columnDefinitionCache.clear();
    }

    manage(columnDefinition, rowData) {
        if (!Array.isArray(columnDefinition)) {
            throw new TypeError("data must be an array");
        }

        const unused = new Set(this.#elements.keys());
        const changes = {added: [], updated: [], deleted: [], moved: []};
        const newOrder = [];
        const rowName = rowData.name;
        if (typeof rowName !== "string") {
            throw new TypeError("row name must be a string");
        }

        for (const index in columnDefinition) {
            const params = columnDefinition[index];
            if (typeof params !== "object" || Array.isArray(params)) {
                throw new TypeError("data entries must be objects");
            }
            const {name, type, ...columnData} = params;
            if (typeof name !== "string") {
                throw new TypeError("column name must be a string");
            }
            if (typeof type !== "string") {
                throw new TypeError("column type must be a string");
            }

            const value = rowData[name];
            const oldIndex = this.#order.indexOf(name);
            if (oldIndex > 0 && oldIndex !== index) {
                changes.moved.push(name);
            }
            newOrder.push(name);

            if (!this.#elements.has(name)) {
                const cellEl = this.composer(name, rowName, type, columnData, value);
                if (cellEl != null) {
                    cellEl.setAttribute("em-key", name);
                    this.mutator(cellEl, columnData, value);
                    this.#elements.set(name, cellEl);
                    changes.added.push(name);
                    this.#target.append(cellEl);
                }
                this.#columnDefinitionCache.set(name, deepClone(columnData));
                this.#valueCache.set(name, deepClone(value));
                this.#types.set(name, type);
            } else if (this.#types.get(name) !== type) {
                const oldEl = this.#elements.get(name);
                oldEl.remove();
                const cellEl = this.composer(name, rowName, type, columnData, value);
                if (cellEl != null) {
                    cellEl.setAttribute("em-key", name);
                    this.mutator(cellEl, columnData, value);
                    this.#elements.set(name, cellEl);
                    changes.added.push(name);
                    this.#target.append(cellEl);
                }
                this.#columnDefinitionCache.set(name, deepClone(columnData));
                this.#valueCache.set(name, deepClone(value));
                this.#types.set(name, type);
            } else {
                const cellEl = this.#elements.get(name);
                const activeEl = cellEl.shadowRoot.activeElement;
                if (this.#checkChange(name, columnData, value)) {
                    this.mutator(cellEl, columnData, value);
                    changes.updated.push(name);
                }
                unused.delete(name);
                this.#target.append(cellEl);
                if (activeEl != null) {
                    setTimeout(() => {
                        activeEl.focus();
                    }, 0);
                }
            }
        }
        this.#order = newOrder;

        this.#target.append(this.#lastCellEl);

        for (const name of unused) {
            const cellEl = this.#elements.get(name);
            cellEl.remove();
            this.#elements.delete(name);
            this.#columnDefinitionCache.delete(name);
            changes.deleted.push(name);
        }

        return changes;
    }

    #checkChange(name, columnData, value) {
        if (typeof name !== "string") {
            return true;
        }
        const cachedColumnDefinition = this.#columnDefinitionCache.get(name);
        if (!isEqual(cachedColumnDefinition, columnData)) {
            this.#columnDefinitionCache.set(name, deepClone(columnData));
            return true;
        }
        const cachedValue = this.#valueCache.get(name);
        if (!isEqual(cachedValue, value)) {
            this.#valueCache.set(name, deepClone(value));
            return true;
        }
        return false;
    }

    composer(columnName, rowName, type, options, value) {
        const cellEl = DataGridCell.createCell(type);

        cellEl.columnName = columnName;
        cellEl.rowName = rowName;

        for (const [attrName, attrValue] of Object.entries(options)) {
            cellEl[attrName] = attrValue;
        }

        if (value != null) {
            cellEl.value = value;
        }

        return cellEl;
    }

    mutator(cellEl, options, value) {
        for (const [attrName, attrValue] of Object.entries(options)) {
            cellEl[attrName] = attrValue;
        }

        if (value != null) {
            cellEl.value = value;
        }
    }

}
