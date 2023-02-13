import CustomElement from "../../element/CustomElement.js";
import ElementManager from "../../../util/html/ElementManager.js";
import "../../i18n/I18nLabel.js";
import TPL from "./TreeNode.js.html" assert {type: "html"};
import STYLE from "./TreeNode.js.css" assert {type: "css"};

function treeComposer(key, params) {
    const {label = key, data = {}, children} = params;
    const el = document.createElement("emc-tree-node");
    el.ref = key;
    el.label = label;
    for (const key in data) {
        el.dataset[key] = data[key];
    }
    if (children != null) {
        el.loadConfig(children);
        el.forceCollapsible = true;
    } else {
        el.forceCollapsible = false;
    }
    return el;
}

function treeMutator(el, key, params) {
    const {label = key, data = {}, children} = params;
    el.label = label;
    for (const key in data) {
        el.dataset[key] = data[key];
    }
    if (children != null) {
        el.loadConfig(children);
        el.forceCollapsible = true;
    } else {
        el.forceCollapsible = false;
    }
}

export default class TreeNode extends CustomElement {

    #elManager;

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
            ev.path = [targetIndex];
            ev.refPath = [this.ref];
            ev.left = event.clientX;
            ev.top = event.clientY;
            this.dispatchEvent(ev);
        });
        this.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const ev = new Event("menu", {bubbles: true, cancelable: true});
            ev.element = this;
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
            ev.path = [targetIndex, ...event.path ?? []];
            ev.refPath = [this.ref, ...event.refPath ?? []];
            ev.left = event.left;
            ev.top = event.top;
            this.dispatchEvent(ev);
        });
        subTreeEl.addEventListener("menu", (event) => {
            event.stopPropagation();
            const targetIndex = Array.from(this.parentElement.children).indexOf(this);
            const ev = new Event("menu", {bubbles: true, cancelable: true});
            ev.element = event.element;
            ev.path = [targetIndex, ...event.path ?? []];
            ev.refPath = [this.ref, ...event.refPath ?? []];
            ev.left = event.left;
            ev.top = event.top;
            this.dispatchEvent(ev);
        });
        /* --- */
        const nodeEl = this.shadowRoot.getElementById("node");
        const collapseEl = this.shadowRoot.getElementById("collapse");
        collapseEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            nodeEl.classList.toggle("collapsed");
        });
        /* --- */
        this.#elManager = new ElementManager(this, {
            composer: treeComposer,
            mutator: treeMutator
        });
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

    static get observedAttributes() {
        return ["label"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "label": {
                    if (oldValue != newValue) {
                        this.shadowRoot.getElementById("label").i18nValue = newValue;
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
        this.#elManager.manage(data);
    }

}

customElements.define("emc-tree-node", TreeNode);

