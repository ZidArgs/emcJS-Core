import {
    isEqual
} from "../helper/Comparator.js";
import {
    deepClone
} from "../helper/DeepClone.js";

const PX_REGEXP = /^[0-9]+(?:\.[0-9]+)?$/;

function getStyleLengthValue(value) {
    if (PX_REGEXP.test(value)) {
        return `${Math.max(parseFloat(value), 50)}px`;
    }
    return value;
}

export default class HeaderManager {

    #target;

    #elements = new Map();

    #order = [];

    #columnDefinitionCache = new Map();

    #lastHeaderCellEl;

    constructor(target) {
        if (!(target instanceof HTMLTableRowElement)) {
            throw new TypeError("target must be of type HTMLTableRowElement");
        }
        this.#target = target;

        this.#lastHeaderCellEl = document.createElement("th")
        this.#lastHeaderCellEl.classList.add("lastCell");
    }

    purge() {
        this.#target.innerHTML = "";
        this.#order = [];
        this.#elements.clear();
        this.#columnDefinitionCache.clear();

        this.#target.append(this.#lastHeaderCellEl);
    }

    manage(columnDefinition) {
        if (!Array.isArray(columnDefinition)) {
            throw new TypeError("data must be an array");
        }

        const unused = new Set(this.#elements.keys());
        const changes = {added: [], updated: [], deleted: [], moved: []};
        const newOrder = [];

        for (const index in columnDefinition) {
            const params = columnDefinition[index];
            if (typeof params !== "object" || Array.isArray(params)) {
                throw new TypeError("data entries must be objects");
            }
            const {name, ...columnData} = params;
            if (typeof name !== "string") {
                throw new TypeError("column name must be a string");
            }

            const oldIndex = this.#order.indexOf(name);
            if (oldIndex > 0 && oldIndex !== index) {
                changes.moved.push(name);
            }
            newOrder.push(name);

            if (!this.#elements.has(name)) {
                const headerCellEl = this.composer(name, columnData);
                if (headerCellEl != null) {
                    headerCellEl.setAttribute("em-key", name);
                    this.mutator(headerCellEl, name, columnData);
                    this.#elements.set(name, headerCellEl);
                    changes.added.push(name);
                    this.#target.append(headerCellEl);
                }
                this.#columnDefinitionCache.set(name, deepClone(columnData));
            } else {
                const headerCellEl = this.#elements.get(name);
                if (this.#checkChange(name, columnData)) {
                    this.mutator(headerCellEl, name, columnData);
                    changes.updated.push(name);
                }
                unused.delete(name);
                this.#target.append(headerCellEl);
            }
        }
        this.#order = newOrder;

        this.#target.append(this.#lastHeaderCellEl);

        for (const name of unused) {
            const headerCellEl = this.#elements.get(name);
            headerCellEl.remove();
            this.#elements.delete(name);
            this.#columnDefinitionCache.delete(name);
            changes.deleted.push(name);
        }

        return changes;
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
        const headerCellEl = document.createElement("th");
        const {label, width} = columnData;

        headerCellEl.innerText = label ?? name;
        if (width != null) {
            const styleWidth = getStyleLengthValue(width);
            headerCellEl.style.minWidth = styleWidth;
            headerCellEl.style.width = styleWidth;
        }

        return headerCellEl;
    }

    mutator(headerCellEl, name, columnData) {
        const {label, width} = columnData;

        headerCellEl.innerText = label ?? name;
        if (width != null) {
            const styleWidth = getStyleLengthValue(width);
            headerCellEl.style.minWidth = styleWidth;
            headerCellEl.style.width = styleWidth;
        }
    }

}
