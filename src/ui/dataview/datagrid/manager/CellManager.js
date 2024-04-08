import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import {
    deepClone
} from "../../../../util/helper/DeepClone.js";
import {
    getArrayMutations
} from "../../../../util/helper/collection/ArrayMutations.js";
import DataGridCell from "../components/cell/DataGridCell.js";
import CellCache from "../data/CellCache.js";

export default class CellManager {

    #dataGridId;

    #cellCache;

    #target;

    #rowKey;

    #elements = new Map();

    #order = [];

    #types = new Map();

    #columnDefinitionCache = new Map();

    #valueCache = new Map();

    #selectCellEl;

    #selectCheckboxEl;

    #lastCellEl;

    constructor(target, cellCache, dataGridId) {
        if (!(target instanceof HTMLTableRowElement)) {
            throw new TypeError("target must be of type HTMLTableRowElement");
        }
        if (!(cellCache instanceof CellCache)) {
            throw new TypeError("cellCache must be of type CellCache");
        }
        this.#dataGridId = dataGridId;
        this.#cellCache = cellCache;
        this.#target = target;

        this.#selectCellEl = document.createElement("td");
        this.#selectCheckboxEl = document.createElement("input");
        this.#selectCheckboxEl.type = "checkbox";
        this.#selectCheckboxEl.addEventListener("change", () => {
            const ev = new Event("selection", {bubbles: true, cancelable: true});
            ev.data = {
                value: this.#selectCheckboxEl.checked,
                rowKey: this.#rowKey
            };
            this.#selectCheckboxEl.dispatchEvent(ev);
        });
        this.#selectCellEl.className = "select-cell";
        this.#selectCellEl.append(this.#selectCheckboxEl);

        this.#lastCellEl = document.createElement("td");
        this.#lastCellEl.classList.add("lastCell");
    }

    purge() {
        this.#target.innerHTML = "";
        this.#order = [];
        this.#elements.clear();
        this.#columnDefinitionCache.clear();

        this.#target.append(this.#lastCellEl);
        this.#target.prepend(this.#selectCellEl);
    }

    manage(columnDefinition, rowData, isSelected) {
        if (!Array.isArray(columnDefinition)) {
            throw new TypeError("data must be an array");
        }

        const unused = new Set(this.#elements.keys());
        const newOrder = [];
        this.#rowKey = rowData.key;
        if (typeof this.#rowKey !== "string") {
            throw new TypeError("row key must be a string");
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
            newOrder.push(name);

            if (!this.#elements.has(name)) {
                const cellEl = this.composer(name, this.#rowKey, type, columnData, value, rowData);
                if (cellEl != null) {
                    cellEl.setAttribute("col-name", name);
                    cellEl.setAttribute("row-key", this.#rowKey);
                    this.mutator(cellEl, columnData, value, rowData);
                    this.#elements.set(name, cellEl);
                    this.#cellCache.addCell(this.#rowKey, name, cellEl);
                }
                this.#columnDefinitionCache.set(name, deepClone(columnData));
                this.#valueCache.set(name, deepClone(value));
                this.#types.set(name, type);
            } else if (this.#types.get(name) !== type) {
                const oldEl = this.#elements.get(name);
                oldEl.remove();
                const cellEl = this.composer(name, this.#rowKey, type, columnData, value, rowData);
                if (cellEl != null) {
                    this.mutator(cellEl, columnData, value, rowData);
                    this.#elements.set(name, cellEl);
                }
                this.#columnDefinitionCache.set(name, deepClone(columnData));
                this.#valueCache.set(name, deepClone(value));
                this.#types.set(name, type);
            } else {
                const cellEl = this.#elements.get(name);
                const activeEl = cellEl.shadowRoot.activeElement;
                if (this.#checkChange(name, columnData, value)) {
                    this.mutator(cellEl, columnData, value, rowData);
                }
                unused.delete(name);
                if (activeEl != null) {
                    setTimeout(() => {
                        activeEl.focus();
                    }, 0);
                }
            }
        }

        for (const name of unused) {
            const cellEl = this.#elements.get(name);
            cellEl.remove();
            this.#elements.delete(name);
            this.#cellCache.removeCell(this.#rowKey, name);
            this.#columnDefinitionCache.delete(name);
        }

        // add select element
        this.#selectCheckboxEl.checked = isSelected;
        this.#selectCheckboxEl.setAttribute("row-key", this.#rowKey);

        if (!isEqual(newOrder, this.#order)) {
            this.#order = newOrder;
            this.#render();
        }
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

    composer(columnName, rowKey, type, options, value, rowData) {
        const cellEl = DataGridCell.createCell(type, this.#dataGridId);

        cellEl.columnName = columnName;
        cellEl.rowKey = rowKey;

        for (const [attrName, attrValue] of Object.entries(options)) {
            if (attrName === "caption" || attrName === "value") {
                continue;
            }
            cellEl[attrName] = attrValue;
        }

        if (value != null) {
            cellEl.value = value;
        }

        cellEl.rowData = rowData;

        return cellEl;
    }

    mutator(cellEl, options, value, rowData) {
        const currentAttributes = new Set([...cellEl.attributes].map((a) => {
            return a.name;
        }).filter((a) => {
            return a !== "class" && a !== "width" && a !== "caption" && a !== "col-name" && a !== "row-key" && a !== "value";
        }));
        for (const [attrName, attrValue] of Object.entries(options)) {
            if (attrName === "caption" || attrName === "value") {
                continue;
            }
            currentAttributes.delete(attrName);
            cellEl[attrName] = attrValue;
        }

        for (const attrName of currentAttributes) {
            cellEl[attrName] = null;
        }

        cellEl.rowData = rowData;

        if (value != null) {
            cellEl.value = value;
        }
    }

    #render = debounce(() => {
        // remove special cells
        this.#lastCellEl.remove();
        this.#selectCellEl.remove();
        /* --- */
        const children = this.#target.children;
        if (children.length > 0) {
            const currentOrder = [...children].map((el) => el.getAttribute("col-name") ?? "");
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
        // add special cells
        this.#target.append(this.#lastCellEl);
        this.#target.prepend(this.#selectCellEl);
    });

}
