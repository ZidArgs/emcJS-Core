import Template from "../util/html/Template.js";
import GlobalStyle from "../util/html/GlobalStyle.js";
import CustomElement from "./CustomElement.js";
import "./overlay/window/WindowLayer.js";
import "./overlay/message/MessageLayer.js";
import "./overlay/ctxmenu/CtxMenuLayer.js";

const TPL = new Template(`
<emc-ctxmenulayer>
    <emc-tooltiplayer>
        <slot></slot>
    </emc-tooltiplayer>
</emc-ctxmenulayer>
<emc-messagelayer name="main"></emc-messagelayer>
<emc-windowlayer name="main"></emc-windowlayer>
<emc-windowlayer name="dialogs"></emc-windowlayer>
`);

const STYLE = new GlobalStyle(`
:host {
    width: 100%;
    height: 100%;
    overflow: auto;
}
emc-messagelayer {
    position: absolute;
}
`);

export default class Page extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-page", Page);
