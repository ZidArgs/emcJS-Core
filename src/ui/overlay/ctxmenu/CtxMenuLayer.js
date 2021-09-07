import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";

const TPL = new Template(`
<slot id="slot"></slot>
<slot id="ctxmnu" name="ctxmnu"></slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: contents;
}
#ctxmnu {
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
::slotted([slot="ctxmnu"]) {
    pointer-events: all;
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
