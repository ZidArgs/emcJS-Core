import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import CustomElement from "../../CustomElement.js";

const TPL = new Template(`
<slot id="slot"></slot>
<slot id="tooltip" name="tooltip"></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: contents;
}
#tooltip {
    position: fixed;
    display: block;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    cursor: default;
    overflow: hidden;
    pointer-events: none;
    z-index: 900900;
}
::slotted([slot="tooltip"]) {
    pointer-events: all;
}
`);

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
