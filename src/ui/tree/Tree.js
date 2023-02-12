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

}

customElements.define("emc-tree", Tree);

