import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import {isArrayOf} from "/emcJS/util/helper/CheckType.js";
import {isEqual} from "/emcJS/util/helper/Comparator.js";

// TODO animate: https://stackoverflow.com/a/75983399
// also move all elements between dragged and target

const TPL = new HTMLTemplate(`
<li id="sortable-list"></li>
<div id="drag-preview"></div>
`);

const STYLE = new CSSTemplate(`
    :host {
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        min-width: 100px;
        min-height: 2em;
        margin: 0px;
        padding: 0px;
        background-color: #ffffff;
        border-style: solid;
        border-width: 1px;
        border-color: #777777;
        border-radius: 4px;
    }
    #sortable-list {
        list-style: none;
        padding: 2px;
        margin: auto;
    }
    #drag-preview {
        display: none;
    }
    .sortable-item {
        position: relative;
        padding: 5px 10px 5px 25px;
        margin: 2px;
        background-color: #ffffff;
        border-style: solid;
        border-width: 1px;
        border-color: #777777;
        border-radius: 5px;
        font-size: 1.1em;
        color: #333;
        cursor: grab;
        transition: background 0.2s, transform 0.2s;
    }
    .sortable-item:before {
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        left: 5px;
        top: 0px;
        width: 15px;
        height: 100%;
        font-size: 0.7em;
        font-weight: bold;
        writing-mode: vertical-lr;
        letter-spacing: -4px;
        opacity: 0.5;
        content: "\u20D3\u2800\u20D3\u2800\u20D3\u2800";
    }
    .dragging {
        transform: scale(1.03);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
`);

export default class SortInput extends HTMLElement {

    #observer;

    #items = {};

    #value = [];

    #sortableListEl;

    #dragPreviewEl;

    #draggingItemEl;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#sortableListEl = this.shadowRoot.getElementById("sortable-list");
        this.#dragPreviewEl = this.shadowRoot.getElementById("drag-preview");
        this.#sortableListEl.addEventListener("dragstart", (e) => {
            this.#draggingItemEl = e.target;
            this.#draggingItemEl.classList.add("dragging");
            e.dataTransfer.dropEffect = "move";
            e.dataTransfer.setDragImage(this.#dragPreviewEl, 0, 0);
        });
        this.#sortableListEl.addEventListener("dragend", () => {
            this.#draggingItemEl.classList.remove("dragging");
            this.#draggingItemEl = null;
            const itemEls = [...this.shadowRoot.querySelectorAll(".sortable-item")];
            const newValue = [];
            for (const itemEl of itemEls) {
                newValue.push(itemEl.dataset.value);
            }
            this.value = newValue;
        });
        this.addEventListener("dragover", (e) => {
            if (this.#draggingItemEl) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        this.addEventListener("dragenter", (e) => {
            if (this.#draggingItemEl) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        /* --- */
        this.#observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "childList") {
                    // const target = mutation.target;
                    // eslint-disable-next-line no-unused-vars
                    for (const element of mutation.addedNodes) {
                        this.#updateItems();
                    }
                    // eslint-disable-next-line no-unused-vars
                    for (const element of mutation.removedNodes) {
                        this.#updateItems();
                    }
                }
            }
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback?.();
        }
        this.#observer.observe(this, {
            childList: true,
            subtree: false
        });
        this.#updateItems();
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback?.();
        }
        this.#observer.disconnect();
    }

    get value() {
        return [...this.#value];
    }

    set value(value) {
        if (!isArrayOf(value, (el) => typeof el === "string")) {
            return;
        }
        const newValue = value.filter((el) => this.#items[el] != null);
        for (const key of Object.keys(this.#items)) {
            if (!newValue.includes(key)) {
                newValue.push(key);
            }
        }
        const oldValue = this.#value;
        if (!isEqual(newValue, oldValue)) {
            this.#value = newValue;
            this.#render();
            const event = new Event("change");
            event.value = this.value;
            event.oldValue = oldValue;
            this.dispatchEvent(event);
        }
    }

    #updateItems() {
        const items = [...this.querySelectorAll("option")];
        this.#items = {};
        for (const item of items) {
            this.#items[item.value || item.innerText] = item.label || item.innerText || item.value;
        }
        this.value = this.#value;
    }

    #render() {
        this.#sortableListEl.innerHTML = "";
        for (const key of this.#value) {
            const label = this.#items[key];
            const itemEl = document.createElement("li");
            itemEl.className = "sortable-item";
            itemEl.draggable = true;
            itemEl.dataset.value = key;
            itemEl.innerText = label;
            itemEl.addEventListener("dragover", (e) => this.#dragOverItem(e.target, e.clientY));
            this.#sortableListEl.append(itemEl);
        }
    }

    #dragOverItem(draggingOverItem, cursorY) {
        if (this.#draggingItemEl && draggingOverItem && draggingOverItem !== this.#draggingItemEl) {
            const draggedBox = this.#draggingItemEl.getBoundingClientRect();
            if (cursorY > draggedBox.bottom) {
                const nextSibling = draggingOverItem.nextSibling;
                if (nextSibling) {
                    this.#sortableListEl.insertBefore(this.#draggingItemEl, nextSibling);
                } else {
                    this.#sortableListEl.appendChild(this.#draggingItemEl);
                }
            } else if (cursorY < draggedBox.top) {
                this.#sortableListEl.insertBefore(this.#draggingItemEl, draggingOverItem);
            }
        }
    }

}

customElements.define("c-sort-input", SortInput);
