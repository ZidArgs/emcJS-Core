import CustomElement from "../element/CustomElement.js";
import TPL from "./BubbleLayer.js.html" assert {type: "html"};
import STYLE from "./BubbleLayer.js.css" assert {type: "css"};

export default class BubbleLayer extends CustomElement {

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
        if (source instanceof BubbleLayer || source == document.body) {
            return source;
        }
        if (source.assignedSlot != null) {
            return BubbleLayer.findNextLayer(source.assignedSlot);
        }
        if (source.parentElement != null) {
            return BubbleLayer.findNextLayer(source.parentElement);
        }
        if (source.getRootNode()?.host != null) {
            return BubbleLayer.findNextLayer(source.getRootNode().host);
        }
        return document.body;
    }

    static getNextLayerBounds(source) {
        const layerEl = this.findNextLayer(source);
        return layerEl.getBoundingClientRect();
    }

}

customElements.define("emc-bubble-layer", BubbleLayer);
