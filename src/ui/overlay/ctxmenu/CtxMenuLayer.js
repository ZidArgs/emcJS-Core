import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: contents;
    z-index: 900900;
}
`);

export default class CtxMenuLayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    static findNextLayer(source) {
        if (source instanceof CtxMenuLayer || source == document.body) {
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

}

customElements.define("emc-ctxmenulayer", CtxMenuLayer);
