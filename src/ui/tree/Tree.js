import CustomElement from "../element/CustomElement.js";
import {
    sortChildren
} from "../../util/helper/ui/NodeListSort.js";
import {
    scrollIntoViewIfNeeded
} from "../../util/helper/ui/Scroll.js";
import TreeNode from "./components/TreeNode.js";
import TPL from "./Tree.js.html" assert {type: "html"};
import STYLE from "./Tree.js.css" assert {type: "css"};

// TODO add cut/copy/paste functionality
// TODO add optional  search
// TODO for sort add ascending/descending option and folder handling

export default class Tree extends CustomElement {

    #elManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const treeEl = this.shadowRoot.getElementById("tree");
        treeEl.addEventListener("select", (event) => {
            if (!event.data.isSelected) {
                const {element} = event.data;
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
        treeEl.addEventListener("blur", () => {
            const keyboardMarked = this.querySelector(".keyboard-marked");
            if (keyboardMarked != null) {
                keyboardMarked.classList.remove("keyboard-marked");
            }
        });
        treeEl.addEventListener("focus", () => {
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
                    currentEl.click();
                }
                event.preventDefault();
                event.stopPropagation();
            }
        });
        /* --- */
        this.#elManager = TreeNode.createTreeElementManager(this);
    }

    loadConfig(config) {
        const data = [];
        for (const key in config) {
            const options = config[key];
            data.push({...options, key});
        }
        this.#elManager.manage(data);
        if (this.sorted) {
            sortChildren(this);
        }
    }

    loadConfigAtPath(path, config) {
        if (!Array.isArray(path)) {
            throw new Error("path must be an array");
        }
        if (path.length == 0) {
            this.loadConfig(config);
        } else {
            const [key, ...nextPath] = path;
            const target = this.querySelector(`[ref="${key}"]`);
            target.loadConfigAtPath(nextPath, config);
        }
    }

    selectItemByPath(path) {
        const element = this.#getElementByPath(path);
        if (element != null) {
            element.click();
        } else {
            const keyboardMarked = this.querySelector(".keyboard-marked");
            if (keyboardMarked != null) {
                keyboardMarked.classList.remove("keyboard-marked");
            }
            const oldMarked = this.querySelector(".marked");
            if (oldMarked != null) {
                oldMarked.classList.remove("marked");
            }
            const ev = new Event("select", {bubbles: true, cancelable: true});
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

    markItemByPathForMenu(path) {
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

    toggleNodeCollapsed(path, force) {
        const element = this.#getElementByPath(path);
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
            res = res.children[p.shift()];
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
        if (path == null || !path.length) {
            return null;
        }
        const p = [...path];
        let res = this;
        while (p.length) {
            res = res.children[p.shift()];
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

}

customElements.define("emc-tree", Tree);

