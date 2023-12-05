import CustomElement from "../../element/CustomElement.js";
import ElementManager from "../../../util/html/ElementManager.js";
import {
    scrollIntoViewIfNeeded
} from "../../../util/helper/ui/Scroll.js";
import {
    sortChildren
} from "../../../util/helper/ui/NodeListSort.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import i18n from "../../../util/I18n.js";
import "../../i18n/I18nLabel.js";
import TPL from "./TreeNode.js.html" assert {type: "html"};
import STYLE from "./TreeNode.js.css" assert {type: "css"};

const NODE_TYPES = new Map();

class TreeNodeElementManager extends ElementManager {

    composer(key, params) {
        const {nodeType, startCollapsed = false, children} = params;
        const el = TreeNode.createNodeType(nodeType);
        el.ref = key;
        if (children != null) {
            el.forceCollapsible = true;
            el.toggleCollapsed(!!startCollapsed);
        } else {
            el.forceCollapsible = false;
        }
        return el;
    }

    mutator(el, key, params) {
        const {label = key, data = {}, sorted = false, children, ...attr} = params;
        el.label = label;
        el.sorted = sorted;
        for (const name in data) {
            el.dataset[name] = data[name];
        }
        if (children != null) {
            el.loadConfig(children);
            el.forceCollapsible = true;
        } else {
            el.forceCollapsible = false;
        }
        for (const name in attr) {
            const value = attr[name];
            if (value != null) {
                if (typeof value === "object") {
                    el.setAttribute(name, JSON.stringify(value));
                } else if (typeof value === "boolean") {
                    if (value) {
                        el.setAttribute(name, "");
                    } else {
                        el.removeAttribute(name);
                    }
                } else {
                    el.setAttribute(name, value);
                }
            } else {
                el.removeAttribute(name);
            }
        }
    }

}

export default class TreeNode extends CustomElement {

    #nodeEl;

    #elManager;

    #elementData = [];

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const selectEvent = new Event("select", {bubbles: true, cancelable: true});
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
            if (event.pointerType && !selectEvent.defaultPrevented && !contentClickEvent.defaultPrevented) {
                this.toggleCollapsed();
            }
        });
        contentEl.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const menuEvent = new Event("menu", {bubbles: true, cancelable: true});
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
            const contentContextmenuEvent = new MouseEvent("contentcontextmenu", event);
            this.dispatchEvent(contentContextmenuEvent);
            this.dispatchEvent(menuEvent);
        });
        /* --- */
        const subTreeEl = this.shadowRoot.getElementById("tree");
        subTreeEl.addEventListener("select", (event) => {
            event.stopPropagation();
            const {element, index, ref, isSelected, path, refPath, left, top} = event.data;
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const selectEvent = new Event("select", {bubbles: true, cancelable: true});
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
        subTreeEl.addEventListener("menu", (event) => {
            event.stopPropagation();
            const {element, index, ref, isSelected, path, refPath, left, top} = event.data;
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const menuEvent = new Event("menu", {bubbles: true, cancelable: true});
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
        const collapseEl = this.shadowRoot.getElementById("collapse");
        collapseEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.toggleCollapsed();
        });
        /* --- */
        this.#elManager = TreeNode.createTreeElementManager(this);
        /* --- */
        this.#i18nEventManager.setActive(this.getBooleanAttribute("sorted"));
        this.#i18nEventManager.set("language", () => {
            sortChildren(this);
        });
        this.#i18nEventManager.set("translation", () => {
            sortChildren(this);
        });
    }

    click() {
        super.click();
        const contentEl = this.shadowRoot.getElementById("content");
        scrollIntoViewIfNeeded(contentEl, {
            behavior: "smooth",
            block: "nearest"
        });
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
                        this.shadowRoot.getElementById("label").i18nValue = newValue;
                    }
                } break;
                case "sorted": {
                    if (oldValue != newValue) {
                        const sorted = this.getBooleanAttribute("sorted");
                        this.#i18nEventManager.setActive(sorted);
                        if (sorted) {
                            sortChildren(this);
                        } else {
                            this.#elManager.manage(this.#elementData);
                        }
                    }
                } break;
            }
        }
    }

    loadConfig(structure) {
        const data = [];
        for (const key in structure) {
            const config = structure[key];
            data.push({...config, key});
        }
        this.#elementData = data;
        this.#elManager.manage(data);
        if (this.sorted) {
            sortChildren(this);
        }
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

    static createTreeElementManager(container) {
        return new TreeNodeElementManager(container);
    }

}

customElements.define("emc-tree-node", TreeNode);

