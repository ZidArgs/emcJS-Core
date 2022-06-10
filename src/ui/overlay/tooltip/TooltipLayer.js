import CustomElement from "../../element/CustomElement.js";
import TPL from "./TooltipLayer.html" assert {type: "html"};
import STYLE from "./TooltipLayer.css" assert {type: "css"};

export default class TooltipLayer extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    static findNextLayer(source) {
        if (source instanceof TooltipLayer || source == document.body) {
            return source;
        }
        if (source.assignedSlot != null) {
            return TooltipLayer.findNextLayer(source.assignedSlot);
        }
        if (source.parentElement != null) {
            return TooltipLayer.findNextLayer(source.parentElement);
        }
        if (source.getRootNode()?.host != null) {
            return TooltipLayer.findNextLayer(source.getRootNode().host);
        }
        return document.body;
    }

}

customElements.define("emc-tooltiplayer", TooltipLayer);
