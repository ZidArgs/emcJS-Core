import CustomElement from "../../element/CustomElement.js";
import TreeNodeElementManager from "../manager/TreeNodeElementManager.js";
import {scrollIntoViewIfNeeded} from "../../../util/helper/ui/Scroll.js";
import {nodeTextComparator} from "../../../util/helper/ui/NodeListSort.js";
import {debounce} from "../../../util/Debouncer.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import i18n from "../../../util/I18n.js";
import "../../i18n/I18nLabel.js";
import TPL from "./TreeNode.js.html" assert {type: "html"};
import STYLE from "./TreeNode.js.css" assert {type: "css"};

const NODE_TYPES = new Map();

export default class TreeNode extends CustomElement {

    #nodeEl;

    #subTreeEl;

    #labelEl;

    #contentEl;

    #collapseEl;

    #elementManager;

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#labelEl = this.shadowRoot.getElementById("label");
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#contentEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const selectEvent = new Event("select", {
                bubbles: true,
                cancelable: true
            });
            selectEvent.data = {
                element: this,
                index: targetIndex,
                ref: this.ref,
                isSelected: this.classList.contains("marked"),
                path: [targetIndex],
                refPath: [this.ref],
                left: event.clientX,
                top: event.clientY
            };
            this.dispatchEvent(selectEvent);

            const contentClickEvent = new MouseEvent("contentclick", event);
            this.dispatchEvent(contentClickEvent);

            if (event.pointerType && !contentClickEvent.defaultPrevented) {
                this.toggleCollapsed();
            }
        });
        this.#contentEl.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const menuEvent = new Event("menu", {
                bubbles: true,
                cancelable: true
            });
            menuEvent.data = {
                element: this,
                index: targetIndex,
                ref: this.ref,
                isSelected: this.classList.contains("marked"),
                path: [targetIndex],
                refPath: [this.ref],
                left: event.clientX,
                top: event.clientY
            };
            this.dispatchEvent(menuEvent);

            const contentContextmenuEvent = new MouseEvent("contentcontextmenu", event);
            this.dispatchEvent(contentContextmenuEvent);
        });
        /* --- */
        this.#subTreeEl = this.shadowRoot.getElementById("tree");
        this.#subTreeEl.addEventListener("select", (event) => {
            event.stopPropagation();
            const {
                element, index, ref, isSelected, path, refPath, left, top
            } = event.data;
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const selectEvent = new Event("select", {
                bubbles: true,
                cancelable: true
            });
            selectEvent.data = {
                element,
                index,
                ref,
                isSelected,
                path: [targetIndex, ...path ?? []],
                refPath: [this.ref, ...refPath ?? []],
                left,
                top
            };
            this.dispatchEvent(selectEvent);
            if (selectEvent.defaultPrevented) {
                event.preventDefault();
            }
        });
        this.#subTreeEl.addEventListener("menu", (event) => {
            event.stopPropagation();
            const {
                element, index, ref, isSelected, path, refPath, left, top
            } = event.data;
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const menuEvent = new Event("menu", {
                bubbles: true,
                cancelable: true
            });
            menuEvent.data = {
                element,
                index,
                ref,
                isSelected,
                path: [targetIndex, ...path ?? []],
                refPath: [this.ref, ...refPath ?? []],
                left,
                top
            };
            this.dispatchEvent(menuEvent);
        });
        /* --- */
        this.#nodeEl = this.shadowRoot.getElementById("node");
        this.#collapseEl = this.shadowRoot.getElementById("collapse");
        this.#collapseEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.toggleCollapsed();
        });
        /* --- */
        this.#elementManager = new TreeNodeElementManager(this, TreeNode);
        if (this.sorted) {
            this.#elementManager.registerSortFunction(this.#sortByNameFunction);
        }
        /* --- */
        this.#i18nEventManager.active = this.sorted;
        this.#i18nEventManager.set("language", () => {
            this.#sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#sort();
        });
    }

    connectedCallback() {
        const sorted = this.sorted;
        this.#i18nEventManager.active = sorted;
        if (sorted) {
            this.#elementManager.registerSortFunction(this.#sortByNameFunction);
        }
    }

    get isCollapsible() {
        return this.forceCollapsible || this.children.length;
    }

    get isCollapsed() {
        return this.#nodeEl.classList.contains("collapsed");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set label(val) {
        this.setAttribute("label", val);
    }

    get label() {
        return this.getAttribute("label");
    }

    set forceCollapsible(val) {
        this.setBooleanAttribute("forcecollapsible", val);
    }

    get forceCollapsible() {
        return this.getBooleanAttribute("forcecollapsible");
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return ["label", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "label": {
                    if (oldValue != newValue) {
                        this.#labelEl.i18nValue = newValue;
                    }
                } break;
                case "sorted": {
                    if (oldValue != newValue) {
                        const sorted = this.sorted;
                        this.#i18nEventManager.active = sorted;
                        if (sorted) {
                            this.#elementManager.registerSortFunction(this.#sortByNameFunction);
                        } else {
                            this.#elementManager.registerSortFunction();
                        }
                    }
                } break;
            }
        }
    }

    select() {
        scrollIntoViewIfNeeded(this.#contentEl, {
            behavior: "smooth",
            block: "nearest"
        });
        this.#contentEl.click();
    }

    toggleCollapsed(force) {
        if (this.isCollapsible) {
            this.#nodeEl.classList.toggle("collapsed", force);
        }
    }

    forceAllCollapsed(collapsed = true) {
        this.toggleCollapsed(!!collapsed);
        for (const ch of this.children) {
            ch.forceAllCollapsed(collapsed);
        }
    }

    loadConfig(structure) {
        const data = [];
        for (const key in structure) {
            const config = structure[key];
            data.push({
                ...config,
                key
            });
        }
        this.#elementManager.manage(data);
    }

    static registerNodeType(type, TreeNodeClass) {
        if (typeof type !== "string" || type === "") {
            throw new TypeError("type must be a non empty string");
        }
        if (TreeNodeClass === TreeNode) {
            throw new TypeError("can not register TreeNode itself");
        }
        if (!(TreeNodeClass.prototype instanceof TreeNode)) {
            throw new TypeError("registered types must inherit from TreeNode");
        }
        if (NODE_TYPES.has(type)) {
            throw new Error(`type "${type}" already registered`);
        }
        NODE_TYPES.set(type, TreeNodeClass);
        return this;
    }

    static createNodeType(type) {
        const TreeNodeClass = NODE_TYPES.get(type) ?? TreeNode;
        return new TreeNodeClass();
    }

    get comparatorText() {
        return this.#labelEl.innerText;
    }

    #sort = debounce(() => {
        this.#elementManager.sort();
    }, 1000);

    #sortByNameFunction(entry0, entry1) {
        const {element: el0} = entry0;
        const {element: el1} = entry1;
        return nodeTextComparator(el0, el1);
    }

}

customElements.define("emc-tree-node", TreeNode);

