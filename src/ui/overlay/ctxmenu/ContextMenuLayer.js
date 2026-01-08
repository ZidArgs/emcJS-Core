import CustomElement from "../../element/CustomElement.js";
import TPL from "./ContextMenuLayer.js.html" assert {type: "html"};
// import STYLE from "./ContextMenuLayer.js.css" assert {type: "css"};

export default class ContextMenuLayer extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        // STYLE.apply(this.shadowRoot);
        /* --- */
    }

    static findNextLayer(source) {
        if (!(source instanceof Node)) {
            throw new Error("can only traverse instances of Node");
        }
        if (source instanceof ContextMenuLayer || source === document.body) {
            return source;
        }
        if (source.assignedSlot != null) {
            return ContextMenuLayer.findNextLayer(source.assignedSlot);
        }
        if (source.parentElement != null) {
            return ContextMenuLayer.findNextLayer(source.parentElement);
        }
        if (source.getRootNode()?.host != null) {
            return ContextMenuLayer.findNextLayer(source.getRootNode().host);
        }
        return document.body;
    }

    static getNextLayerBounds(source) {
        const layerEl = this.findNextLayer(source);
        return layerEl.getBoundingClientRect();
    }

}

customElements.define("emc-contextmenu-layer", ContextMenuLayer);
