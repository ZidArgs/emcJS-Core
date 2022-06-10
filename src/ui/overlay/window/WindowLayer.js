import IndexedSet from "../../../data/collection/IndexedSet.js";
import CustomElement from "../../element/CustomElement.js";
import ChildlistMutationObserverMixin from "../../mixin/ChildlistMutationObserverMixin.js";
import TPL from "./WindowLayer.html" assert {type: "html"};
import STYLE from "./WindowLayer.css" assert {type: "css"};

const LAYER = new Map();
let DEFAULT = null;

const WINDOW_STACK = new IndexedSet();

export default class WindowLayer extends ChildlistMutationObserverMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        if (DEFAULT == null) {
            DEFAULT = this;
        }
    }

    disconnectedCallback() {
        this.innerHTML = "";
    }

    nodeAddedCallback(element) {
        const current = WINDOW_STACK.last();
        if (current != null) {
            current.classList.add("inactive");
            current.parentElement.classList.add("inactive");
        }
        // ---
        element.classList.remove("inactive");
        this.classList.remove("inactive");
        WINDOW_STACK.add(element);
    }

    nodeRemovedCallback(element) {
        const old = WINDOW_STACK.last();
        if (old === element) {
            WINDOW_STACK.pop();
            this.classList.add("inactive");
            // ---
            const current = WINDOW_STACK.last();
            if (current != null) {
                current.classList.remove("inactive");
                current.parentElement.classList.remove("inactive");
            }
        }
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    static get observedAttributes() {
        return ["name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "name" && newValue != oldValue) {
            if (LAYER.has(newValue)) {
                throw new Error(`MessageLayer with name "${name}" already exists`);
            }
            LAYER.set(newValue, this);
            if (LAYER.has(oldValue)) {
                LAYER.delete(oldValue);
            }
        }
    }

    setDefault() {
        DEFAULT = this;
    }

    static setDefault(name) {
        if (LAYER.has(name)) {
            DEFAULT = LAYER.get(name);
        }
    }

    static getDefault() {
        return DEFAULT;
    }

    static getLayer(name) {
        return LAYER.get(name);
    }

    static hasLayer(name) {
        return LAYER.has(name);
    }

    static append(element, layer) {
        if (!!layer && WindowLayer.hasLayer(layer)) {
            WindowLayer.getLayer(layer).append(element);
        } else if (DEFAULT != null) {
            DEFAULT.append(element);
        } else {
            document.body.append(element);
        }
    }

}

customElements.define("emc-windowlayer", WindowLayer);
