import CustomElement from "../element/CustomElement.js";
import {nodeTextComparator} from "../../util/helper/ui/NodeListSort.js";
import {scrollIntoViewIfNeeded} from "../../util/helper/ui/Scroll.js";
import {deepClone} from "../../util/helper/DeepClone.js";
import {debounce} from "../../util/Debouncer.js";
import TreeNodeElementManager from "./manager/TreeNodeElementManager.js";
import EventTargetManager from "../../util/event/EventTargetManager.js";
import i18n from "../../util/I18n.js";
import TreeNode from "./components/TreeNode.js";
import TPL from "./Tree.js.html" assert {type: "html"};
import STYLE from "./Tree.js.css" assert {type: "css"};

// TODO add cut/copy/paste functionality
// TODO add optional  search
// TODO for sort add ascending/descending option and folder handling
export default class Tree extends CustomElement {

    #treeEl;

    #elementManager;

    #i18nEventManager = new EventTargetManager(i18n);

    #currentSelectionPath = [];

    #currentSelectionRefPath = [];

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#treeEl = this.shadowRoot.getElementById("tree");
        this.#treeEl.addEventListener("select", (event) => {
            if (!event.data.isSelected) {
                const {
                    element, path, refPath
                } = event.data;
                this.#currentSelectionPath = path;
                this.#currentSelectionRefPath = refPath;

                const keyboardMarked = this.querySelector(".keyboard-marked");
                if (keyboardMarked != null) {
                    keyboardMarked.classList.remove("keyboard-marked");
                }
                const oldMarked = this.querySelector(".marked");
                if (oldMarked != null) {
                    oldMarked.classList.remove("marked");
                }
                if (element != null) {
                    element.classList.add("marked");
                }
            }
        });
        this.#treeEl.addEventListener("blur", () => {
            const keyboardMarked = this.querySelector(".keyboard-marked");
            if (keyboardMarked != null) {
                keyboardMarked.classList.remove("keyboard-marked");
            }
        });
        this.#treeEl.addEventListener("focus", () => {
            const currentEl = this.querySelector(".keyboard-marked") ?? this.querySelector(".marked");
            if (currentEl == null) {
                const element = this.#getElementByPath([0]);
                if (element != null) {
                    this.#markKeyboardUsage(null, element);
                }
            }
        });
        /* --- */
        this.addEventListener("keydown", (event) => {
            const {key} = event;
            if (key === "ArrowUp") {
                const currentEl = this.querySelector(".keyboard-marked") ?? this.querySelector(".marked");
                if (currentEl != null) {
                    const nextEl = this.#findPrevNode(currentEl);
                    if (nextEl != null) {
                        this.#markKeyboardUsage(currentEl, nextEl);
                    }
                } else {
                    const element = this.#getElementByPath([0]);
                    if (element != null) {
                        this.#markKeyboardUsage(null, element);
                    }
                }
                event.preventDefault();
                event.stopPropagation();
            } else if (key === "ArrowDown") {
                const currentEl = this.querySelector(".keyboard-marked") ?? this.querySelector(".marked");
                if (currentEl != null) {
                    const nextEl = this.#findNextNode(currentEl);
                    if (nextEl != null) {
                        this.#markKeyboardUsage(currentEl, nextEl);
                    }
                } else {
                    const element = this.#getElementByPath([0]);
                    if (element != null) {
                        this.#markKeyboardUsage(null, element);
                    }
                }
                event.preventDefault();
                event.stopPropagation();
            } else if (key === "ArrowLeft") {
                const currentEl = this.querySelector(".keyboard-marked") ?? this.querySelector(".marked");
                if (currentEl != null && currentEl.isCollapsible) {
                    currentEl.toggleCollapsed(true);
                }
                event.preventDefault();
                event.stopPropagation();
            } else if (key === "ArrowRight") {
                const currentEl = this.querySelector(".keyboard-marked") ?? this.querySelector(".marked");
                if (currentEl != null && currentEl.isCollapsible) {
                    currentEl.toggleCollapsed(false);
                }
                event.preventDefault();
                event.stopPropagation();
            } else if (key === "Enter" || key === " ") {
                const currentEl = this.querySelector(".keyboard-marked");
                if (currentEl != null) {
                    currentEl.select();
                }
                event.preventDefault();
                event.stopPropagation();
            }
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

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return ["sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
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

    loadConfig(config) {
        const data = [];
        for (const key in config) {
            const options = config[key];
            data.push({
                ...options,
                key
            });
        }
        this.#elementManager.manage(data);
    }

    loadConfigAtPath(path, config) {
        if (!Array.isArray(path)) {
            throw new Error("path must be an array");
        }
        if (path.length == 0) {
            this.loadConfig(config);
        } else {
            const node = this.#getElementByPath(path);
            if (node != null) {
                node.loadConfig(config);
            }
        }
    }

    loadConfigAtRefPath(path, config) {
        if (!Array.isArray(path)) {
            throw new Error("path must be an array");
        }
        if (path.length == 0) {
            this.loadConfig(config);
        } else {
            const node = this.#getElementByRefPath(path);
            if (node != null) {
                node.loadConfig(config);
            }
        }
    }

    getSelectedPath() {
        return deepClone(this.#currentSelectionPath);
    }

    getSelectedRefPath() {
        return deepClone(this.#currentSelectionRefPath);
    }

    selectItemByPath(path) {
        const element = this.#getElementByPath(path);
        if (element != null) {
            element.select();
        } else {
            this.#currentSelectionPath = [];
            this.#currentSelectionRefPath = [];
            const keyboardMarked = this.querySelector(".keyboard-marked");
            if (keyboardMarked != null) {
                keyboardMarked.classList.remove("keyboard-marked");
            }
            const oldMarked = this.querySelector(".marked");
            if (oldMarked != null) {
                oldMarked.classList.remove("marked");
            }
            const ev = new Event("select", {
                bubbles: true,
                cancelable: true
            });
            ev.data = {
                element: null,
                ref: undefined,
                isSelected: false,
                path: [],
                refPath: [],
                left: 0,
                top: 0
            };
            this.dispatchEvent(ev);
        }
    }

    selectItemByRefPath(path) {
        const element = this.#getElementByRefPath(path);
        if (element != null) {
            element.select();
        } else {
            this.#currentSelectionPath = [];
            this.#currentSelectionRefPath = [];
            const keyboardMarked = this.querySelector(".keyboard-marked");
            if (keyboardMarked != null) {
                keyboardMarked.classList.remove("keyboard-marked");
            }
            const oldMarked = this.querySelector(".marked");
            if (oldMarked != null) {
                oldMarked.classList.remove("marked");
            }
            const ev = new Event("select", {
                bubbles: true,
                cancelable: true
            });
            ev.data = {
                element: null,
                ref: undefined,
                isSelected: false,
                path: [],
                refPath: [],
                left: 0,
                top: 0
            };
            this.dispatchEvent(ev);
        }
    }

    markItemForMenuByPath(path) {
        const keyboardMarked = this.querySelector(".keyboard-marked");
        if (keyboardMarked != null) {
            keyboardMarked.classList.remove("keyboard-marked");
        }
        const oldMarked = this.querySelector(".ctx-marked");
        if (oldMarked != null) {
            oldMarked.classList.remove("ctx-marked");
        }
        const element = this.#getElementByPath(path);
        if (element != null) {
            element.classList.add("ctx-marked");
        }
    }

    markItemForMenuByRefPath(path) {
        const keyboardMarked = this.querySelector(".keyboard-marked");
        if (keyboardMarked != null) {
            keyboardMarked.classList.remove("keyboard-marked");
        }
        const oldMarked = this.querySelector(".ctx-marked");
        if (oldMarked != null) {
            oldMarked.classList.remove("ctx-marked");
        }
        const element = this.#getElementByRefPath(path);
        if (element != null) {
            element.classList.add("ctx-marked");
        }
    }

    toggleNodeCollapsedByPath(path, force) {
        const element = this.#getElementByPath(path);
        if (element != null) {
            element.toggleCollapsed(force);
        }
    }

    toggleNodeCollapsedByRefPath(path, force) {
        const element = this.#getElementByRefPath(path);
        if (element != null) {
            element.toggleCollapsed(force);
        }
    }

    forcePathExpanded(path) {
        if (path == null || !path.length) {
            return;
        }
        const p = [...path];
        let res = this;
        while (p.length) {
            const i = p.shift();
            res = res.children[i];
            if (res == null) {
                return;
            }
            res.toggleCollapsed(false);
        }
    }

    forceRefPathExpanded(path) {
        if (path == null || !path.length) {
            return;
        }
        const p = [...path];
        let res = this;
        while (p.length) {
            const i = p.shift();
            if (typeof i === "string") {
                res = res.querySelector(`:scope > [ref="${i}"]`);
            } else {
                res = res.children[i];
            }
            if (res == null) {
                return;
            }
            res.toggleCollapsed(false);
        }
    }

    forceAllCollapsed(collapsed = true) {
        for (const ch of this.children) {
            ch.forceAllCollapsed(collapsed);
        }
    }

    #getElementByPath(path) {
        if (path == null || !Array.isArray(path) || !path.length) {
            return null;
        }
        const p = [...path];
        let res = this;
        while (p.length) {
            const i = p.shift();
            res = res.children[i];
            if (res == null) {
                return null;
            }
        }
        return res;
    }

    #getElementByRefPath(path) {
        if (path == null || !Array.isArray(path) || !path.length) {
            return null;
        }
        const p = [...path];
        let res = this;
        while (p.length) {
            const i = p.shift();
            if (typeof i === "string") {
                res = res.querySelector(`:scope > [ref="${i}"]`);
            } else {
                res = res.children[i];
            }
            if (res == null) {
                return null;
            }
        }
        return res;
    }

    getPathForNode(node) {
        if (!this.contains(node)) {
            return null;
        }
        return this.#getPathForNodeRecursive(node);
    }

    #getPathForNodeRecursive(node, res = []) {
        if (node === this) {
            return res;
        }
        const targetIndex = Array.from(node.parentElement.children).indexOf(node);
        res.unshift(targetIndex);
        return this.#getPathForNodeRecursive(node.parentElement, res);
    }

    #findPrevNode(node) {
        if (node === this || !this.contains(node)) {
            return null;
        }
        const prevEl = node.previousElementSibling;
        if (prevEl != null) {
            if (node.children.length && !prevEl.isCollapsed) {
                let current = prevEl;
                while (current.lastElementChild != null && !current.isCollapsed) {
                    current = current.lastElementChild;
                }
                return current;
            }
            return prevEl;
        }
        const parentEl = node.parentElement;
        if (parentEl !== this) {
            return parentEl;
        }
        return null;
    }

    #findNextNode(node) {
        if (node === this || !this.contains(node)) {
            return null;
        }
        if (node.children.length && !node.isCollapsed) {
            return node.firstElementChild;
        }
        let current = node;
        while (current !== this) {
            const nextEl = node.nextElementSibling;
            if (nextEl != null) {
                return nextEl;
            }
            current = current.parentElement;
        }
        return null;
    }

    #markKeyboardUsage(currentEl, nextEl) {
        if (currentEl != null) {
            currentEl.classList.remove("keyboard-marked");
        }
        if (nextEl != null) {
            nextEl.classList.add("keyboard-marked");
            const contentEl = nextEl.shadowRoot.getElementById("content");
            scrollIntoViewIfNeeded(contentEl, {
                behavior: "smooth",
                block: "nearest"
            });
        }
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

customElements.define("emc-tree", Tree);

