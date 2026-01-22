import EventMultiTargetManager from "../../../../../../util/event/EventMultiTargetManager.js";
import DataList from "../../../../../dataview/datalist/DataList.js";
import "./SelectionListEntry.js";
import STYLE from "./SelectionList.js.css" assert {type: "css"};

export default class SelectionList extends DataList {

    #selected = new Set();

    #entryEventManager = new EventMultiTargetManager(false);

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#entryEventManager.set("selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, key
            } = event.data;
            if (!this.multiple) {
                if (value) {
                    const oldKey = [...this.#selected][0];
                    const oldEl = this.getEntry(oldKey);
                    if (oldEl != null) {
                        oldEl.selected = false;
                    }
                    this.#selected.clear();
                    this.#selected.add(key);
                } else if (this.allowDeselect) {
                    this.#selected.clear();
                } else {
                    const oldKey = [...this.#selected][0];
                    const oldEl = this.getEntry(oldKey);
                    if (oldEl != null) {
                        oldEl.selected = true;
                    }
                }
            } else if (value) {
                this.#selected.add(key);
            } else {
                this.#selected.delete(key);
            }
            this.#updateSelectHeader();
            const ev = new Event("selection");
            ev.data = [...this.#selected].sort();
            this.dispatchEvent(ev);
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#entryEventManager.active = true;
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this.#entryEventManager.active = false;
    }

    createListEntry() {
        const el = document.createElement("emc-selectionlist-entry");
        this.#entryEventManager.addTarget(el);
        if (this.disabled) {
            el.disabled = true;
        }
        if (this.readonly) {
            el.readonly = true;
        }
        el.selectable = true;
        return el;
    }

    removeListEntry(el) {
        this.#entryEventManager.removeTarget(el);
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
        return ["selectend", "multiple", "disabled", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "selectend": {
                    const selectEnd = this.selectEnd;
                    const els = this.getAllEntries();
                    for (const el of els) {
                        el.selectEnd = selectEnd;
                    }
                } break;
                case "multiple": {
                    if (!this.multiple) {
                        this.clearSelected();
                    }
                } break;
                case "disabled": {
                    const els = this.getAllEntries();
                    for (const el of els) {
                        el.disabled = this.disabled;
                    }
                } break;
                case "readonly": {
                    const els = this.getAllEntries();
                    for (const el of els) {
                        el.readonly = this.readonly;
                    }
                } break;
            }
        }
    }

    setData(records) {
        super.setData(records);
        this.#updateSelectHeader();
    }

    setSelected(selected) {
        if (selected != null) {
            if (!Array.isArray(selected)) {
                if (typeof selected === "string") {
                    selected = [selected];
                } else {
                    selected = [];
                }
            }
            if (this.multiple) {
                selected = new Set(selected);
                const added = selected.difference(this.#selected);
                const removed = this.#selected.difference(selected);
                for (const key of removed) {
                    this.#selected.delete(key);
                    const el = this.getEntry(key);
                    if (el != null) {
                        el.selected = false;
                    }
                }
                for (const entry of added) {
                    this.#selected.add(entry);
                    const el = this.getEntry(entry);
                    if (el != null) {
                        el.selected = true;
                    }
                }
                if (added.size || removed.size) {
                    this.#updateSelectHeader();
                    const ev = new Event("selection");
                    ev.data = [...this.#selected].sort();
                    this.dispatchEvent(ev);
                }
            } else if (selected.length > 0) {
                const entry = selected[0];
                if (!this.#selected.has(entry)) {
                    for (const key of this.#selected) {
                        const el = this.getEntry(key);
                        if (el != null) {
                            el.selected = false;
                        }
                    }
                    this.#selected.clear();
                    this.#selected.add(entry);
                    const el = this.getEntry(entry);
                    if (el != null) {
                        el.selected = true;
                    }
                }
            }
        }
    }

    getSelected() {
        return [...this.#selected].sort();
    }

    clearSelected() {
        for (const key of this.#selected) {
            const el = this.getEntry(key);
            if (el != null) {
                el.selected = false;
            }
        }
        this.#selected.clear();
        this.#updateSelectHeader();
        const ev = new Event("selection");
        ev.data = [];
        this.dispatchEvent(ev);
    }

    selectAll() {
        if (this.multiple) {
            const els = this.getAllEntries();
            for (const el of els) {
                this.#selected.add(el.key);
                el.selected = true;
            }
        } else {
            this.clearSelected();
            const el = this.shadowRoot.querySelector("[key]");
            el.selected = true;
            this.#selected.add(el.key);
        }
        this.#updateSelectHeader();
        const ev = new Event("selection");
        ev.data = [...this.#selected].sort();
        this.dispatchEvent(ev);
    }

    #updateSelectHeader() {
        const selected = [];
        const els = this.getAllEntries();
        for (const el of els) {
            if (this.#selected.has(el.key)) {
                selected.push(el.key);
            }
        }

        const selectedCount = selected.length;
        const visibleCount = els.length;

        const ev = new Event("selection-header");
        if (selectedCount === 0) { // none selected
            ev.checked = false;
            ev.indeterminate = false;
        } else if (selectedCount === visibleCount) { // all selected
            ev.checked = true;
            ev.indeterminate = false;
        } else { // some selected
            ev.checked = true;
            ev.indeterminate = true;
        }
        this.dispatchEvent(ev);
    }

}

customElements.define("emc-selectionlist", SelectionList);
