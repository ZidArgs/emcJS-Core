import CustomElement from "../../element/CustomElement.js";
import TPL from "./CtxMenuLayer.js.html" assert {type: "html"};
import STYLE from "./CtxMenuLayer.js.css" assert {type: "css"};

export default class CtxMenuLayer extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    static findNextLayer(source) {
        if (!(source instanceof Node)) {
            throw new Error("can only traverse instances of Node");
        }
        if (source instanceof CtxMenuLayer || source === document.body) {
            return source;
        }
        if (source.assignedSlot != null) {
            return CtxMenuLayer.findNextLayer(source.assignedSlot);
        }
        if (source.parentElement != null) {
            return CtxMenuLayer.findNextLayer(source.parentElement);
        }
        if (source.getRootNode()?.host != null) {
            return CtxMenuLayer.findNextLayer(source.getRootNode().host);
        }
        return document.body;
    }

    static getNextLayerBounds(source) {
        const layerEl = this.findNextLayer(source);
        return layerEl.getBoundingClientRect();
    }

}

customElements.define("emc-ctxmenulayer", CtxMenuLayer);
