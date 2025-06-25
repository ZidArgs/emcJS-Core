import {debounce} from "../../../../util/Debouncer.js";
import {isEqual} from "../../../../util/helper/Comparator.js";
import {deepClone} from "../../../../util/helper/DeepClone.js";
import {getArrayMutations} from "../../../../util/helper/collection/ArrayMutations.js";
import DataGridHeaderCell from "../components/cell/DataGridHeaderCell.js";

export default class HeaderManager {

    #dataGridId;

    #target;

    #elements = new Map();

    #order = [];

    #columnDefinitionCache = new Map();

    #selectHeaderCellEl;

    #selectEnd = false;

    #lastHeaderCellEl;

    constructor(target, headerSelectEl, dataGridId) {
        if (!(target instanceof HTMLTableRowElement)) {
            throw new TypeError("target must be of type HTMLTableRowElement");
        }
        if (!(headerSelectEl instanceof HTMLInputElement)) {
            throw new TypeError("headerSelectEl must be of type HTMLInputElement");
        }
        this.#dataGridId = dataGridId;
        this.#target = target;

        this.#selectHeaderCellEl = document.createElement("th");
        this.#selectHeaderCellEl.className = "select-cell select-cell-start";
        this.#selectHeaderCellEl.append(headerSelectEl);

        this.#lastHeaderCellEl = document.createElement("th");
        this.#lastHeaderCellEl.classList.add("lastCell");
    }

    set selectEnd(value) {
        value = !!value;
        if (this.#selectEnd !== value) {
            this.#selectEnd = value;
            this.#selectHeaderCellEl.classList.toggle("select-cell-start", !value);
            this.#selectHeaderCellEl.classList.toggle("select-cell-end", value);
            this.#render();
        }
    }

    get selectEnd() {
        return this.#selectEnd;
    }

    getCellByColumnName(name) {
        return this.#elements.get(name);
    }

    purge() {
        this.#target.innerHTML = "";
        this.#order = [];
        this.#elements.clear();
        this.#columnDefinitionCache.clear();

        this.#target.append(this.#lastHeaderCellEl);
        if (this.#selectEnd) {
            this.#target.append(this.#selectHeaderCellEl);
        } else {
            this.#target.prepend(this.#selectHeaderCellEl);
        }
    }

    manage(columnDefinition) {
        if (!Array.isArray(columnDefinition)) {
            throw new TypeError("data must be an array");
        }

        const unused = new Set(this.#elements.keys());
        const newOrder = [];

        for (const index in columnDefinition) {
            const params = columnDefinition[index];
            if (typeof params !== "object" || Array.isArray(params)) {
                throw new TypeError("data entries must be objects");
            }
            const {
                name, ...columnData
            } = params;
            if (typeof name !== "string") {
                throw new TypeError("column name must be a string");
            }

            newOrder.push(name);

            if (!this.#elements.has(name)) {
                const headerCellEl = this.composer(name, columnData);
                if (headerCellEl != null) {
                    headerCellEl.setAttribute("col-name", name);
                    this.mutator(headerCellEl, name, columnData);
                    this.#elements.set(name, headerCellEl);
                }
                this.#columnDefinitionCache.set(name, deepClone(columnData));
            } else {
                const headerCellEl = this.#elements.get(name);
                if (this.#checkChange(name, columnData)) {
                    this.mutator(headerCellEl, name, columnData);
                }
                unused.delete(name);
            }
        }

        for (const name of unused) {
            const headerCellEl = this.#elements.get(name);
            headerCellEl.remove();
            this.#elements.delete(name);
            this.#columnDefinitionCache.delete(name);
        }

        if (!isEqual(newOrder, this.#order)) {
            this.#order = newOrder;
            this.#render();
        }
    }

    #checkChange(name, columnDefinition) {
        if (typeof name !== "string") {
            return true;
        }
        const cachedColumnDefinition = this.#columnDefinitionCache.get(name);
        if (!isEqual(cachedColumnDefinition, columnDefinition)) {
            this.#columnDefinitionCache.set(name, deepClone(columnDefinition));
            return true;
        }
        return false;
    }

    composer(name, columnData) {
        const headerCellEl = new DataGridHeaderCell(this.#dataGridId);
        const {
            label, sortable = false
        } = columnData;

        headerCellEl.innerText = (label ?? name).trim();
        headerCellEl.title = label ?? name;
        headerCellEl.sortable = sortable;

        return headerCellEl;
    }

    mutator(headerCellEl, name, columnData) {
        const {label} = columnData;

        headerCellEl.innerText = label ?? name;
        headerCellEl.title = label ?? name;
    }

    #render = debounce(() => {
        // remove special cells
        this.#lastHeaderCellEl.remove();
        this.#selectHeaderCellEl.remove();
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
        // add special cells
        this.#target.append(this.#lastHeaderCellEl);
        if (this.#selectEnd) {
            this.#target.append(this.#selectHeaderCellEl);
        } else {
            this.#target.prepend(this.#selectHeaderCellEl);
        }
    });

}
