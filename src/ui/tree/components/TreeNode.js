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

function treeComposer(key, params) {
    const {nodeType, label = key, data = {}, sorted = false, startCollapsed = false, children, ...attr} = params;
    const el = TreeNode.createNodeType(nodeType);
    el.ref = key;
    el.label = label;
    el.sorted = sorted;
    for (const name in data) {
        el.dataset[name] = data[name];
    }
    if (children != null) {
        el.loadConfig(children);
        el.forceCollapsible = true;
        el.toggleCollapsed(!!startCollapsed);
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
    return el;
}

function treeMutator(el, key, params) {
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
        this.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const ev = new Event("select", {bubbles: true, cancelable: true});
            ev.element = this;
            ev.ref = this.ref;
            ev.isSelected = this.classList.contains("marked");
            ev.path = [targetIndex];
            ev.refPath = [this.ref];
            ev.left = event.clientX;
            ev.top = event.clientY;
            this.dispatchEvent(ev);
            if (event.pointerType && !ev.defaultPrevented) {
                this.toggleCollapsed();
            }
        });
        this.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const ev = new Event("menu", {bubbles: true, cancelable: true});
            ev.element = this;
            ev.ref = this.ref;
            ev.path = [targetIndex];
            ev.refPath = [this.ref];
            ev.left = event.clientX;
            ev.top = event.clientY;
            this.dispatchEvent(ev);
        });
        /* --- */
        const subTreeEl = this.shadowRoot.getElementById("tree");
        subTreeEl.addEventListener("select", (event) => {
            event.stopPropagation();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const ev = new Event("select", {bubbles: true, cancelable: true});
            ev.element = event.element;
            ev.ref = event.ref;
            ev.isSelected = event.isSelected;
            ev.path = [targetIndex, ...event.path ?? []];
            ev.refPath = [this.ref, ...event.refPath ?? []];
            ev.left = event.left;
            ev.top = event.top;
            this.dispatchEvent(ev);
            if (ev.defaultPrevented) {
                event.preventDefault();
            }
        });
        subTreeEl.addEventListener("menu", (event) => {
            event.stopPropagation();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const ev = new Event("menu", {bubbles: true, cancelable: true});
            ev.element = event.element;
            ev.ref = event.ref;
            ev.path = [targetIndex, ...event.path ?? []];
            ev.refPath = [this.ref, ...event.refPath ?? []];
            ev.left = event.left;
            ev.top = event.top;
            this.dispatchEvent(ev);
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
        this.#elManager = TreeNode.getTreeElementManager(this);
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

    static getTreeElementManager(container) {
        return new ElementManager(container, {
            composer: treeComposer,
            mutator: treeMutator
        });
    }

}

customElements.define("emc-tree-node", TreeNode);

