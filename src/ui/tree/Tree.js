import CustomElement from "../element/CustomElement.js";
import ElementManager from "../../util/html/ElementManager.js";
import "./components/TreeNode.js";
import TPL from "./Tree.js.html" assert {type: "html"};
import STYLE from "./Tree.js.css" assert {type: "css"};

function treeComposer(key, params) {
    const {label = key, data = {}, children = {}} = params;
    const el = document.createElement("emc-tree-node");
    el.ref = key;
    el.label = label;
    for (const key in data) {
        el.dataset[key] = data[key];
    }
    el.loadConfig(children);
    return el;
}

function treeMutator(el, key, params) {
    const {label = key, data = {}, children = {}} = params;
    el.label = label;
    for (const key in data) {
        el.dataset[key] = data[key];
    }
    el.loadConfig(children);
}

export default class Tree extends CustomElement {

    #elManager;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const treeEl = this.shadowRoot.getElementById("tree");
        treeEl.addEventListener("select", (event) => {
            const {element} = event;
            const oldMarked = this.querySelector(".marked");
            if (oldMarked != null) {
                oldMarked.classList.remove("marked");
            }
            if (element != null) {
                element.classList.add("marked");
            }
        });
        /* --- */
        this.#elManager = new ElementManager(this, {
            composer: treeComposer,
            mutator: treeMutator
        });
    }

    loadConfig(structure) {
        const data = [];
        for (const key in structure) {
            const config = structure[key];
            data.push({...config, key});
        }
        this.#elManager.manage(data);
    }

    selectItemByPath(path) {
        const element = this.#getElementByPath(path);
        if (element != null) {
            element.click();
        } else {
            const oldMarked = this.querySelector(".marked");
            if (oldMarked != null) {
                oldMarked.classList.remove("marked");
            }
            const ev = new Event("select", {bubbles: true, cancelable: true});
            ev.element = null;
            ev.path = [];
            ev.refPath = [];
            ev.left = 0;
            ev.top = 0;
            this.dispatchEvent(ev);
        }
    }

    markItemByPathForMenu(path) {
        const oldMarked = this.querySelector(".ctx-marked");
        if (oldMarked != null) {
            oldMarked.classList.remove("ctx-marked");
        }
        const element = this.#getElementByPath(path);
        if (element != null) {
            element.classList.add("ctx-marked");
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

}

customElements.define("emc-tree", Tree);

