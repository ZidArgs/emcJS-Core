import IndexedSet from "../../data/collection/IndexedSet.js";
import CustomElement from "../element/CustomElement.js";
import ChildlistMutationObserverMixin from "../mixin/ChildlistMutationObserverMixin.js";
import TPL from "./ModalLayer.js.html" assert {type: "html"};
import STYLE from "./ModalLayer.js.css" assert {type: "css"};

export default class ModalLayer extends ChildlistMutationObserverMixin(CustomElement) {

    static #layerList = new Map();

    static #defaultLayer = null;

    static #modalStack = new IndexedSet();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.innerHTML = "";
    }

    nodeAddedCallback(element) {
        const current = ModalLayer.#modalStack.last();
        if (current != null) {
            current.classList.add("inactive");
            current.parentElement?.classList.add("inactive");
        }
        // ---
        element.classList.remove("inactive");
        this.classList.remove("inactive");
        ModalLayer.#modalStack.add(element);
    }

    nodeRemovedCallback(element) {
        const old = ModalLayer.#modalStack.last();
        if (old === element) {
            ModalLayer.#modalStack.pop();
            this.classList.add("inactive");
            // ---
            const current = ModalLayer.#modalStack.last();
            if (current != null) {
                current.classList.remove("inactive");
                current.parentElement?.classList.remove("inactive");
            }
        }
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set default(value) {
        this.setBooleanAttribute("default", value);
    }

    get default() {
        return this.getBooleanAttribute("default");
    }

    static get observedAttributes() {
        return ["name", "default"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "name": {
                if (oldValue != newValue) {
                    if (ModalLayer.#layerList.has(newValue)) {
                        throw new Error(`MessageLayer with name "${name}" already exists`);
                    }
                    ModalLayer.#layerList.set(newValue, this);
                    if (ModalLayer.#layerList.has(oldValue)) {
                        ModalLayer.#layerList.delete(oldValue);
                    }
                }
            } break;
            case "default": {
                if (oldValue != newValue && this.default) {
                    this.setDefault();
                }
            } break;
        }
    }

    setDefault() {
        ModalLayer.#defaultLayer = this;
    }

    static setDefault(name) {
        if (ModalLayer.#layerList.has(name)) {
            ModalLayer.#defaultLayer = ModalLayer.#layerList.get(name);
        }
    }

    static getDefault() {
        return ModalLayer.#defaultLayer;
    }

    static getLayer(name) {
        return ModalLayer.#layerList.get(name);
    }

    static hasLayer(name) {
        return ModalLayer.#layerList.has(name);
    }

    static append(element, layer) {
        if (!!layer && ModalLayer.hasLayer(layer)) {
            ModalLayer.getLayer(layer).append(element);
        } else if (ModalLayer.#defaultLayer != null) {
            ModalLayer.#defaultLayer.append(element);
        } else {
            document.body.append(element);
        }
    }

}

customElements.define("emc-modal-layer", ModalLayer);
