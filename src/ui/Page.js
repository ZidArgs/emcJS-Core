import CustomElement from "./element/CustomElement.js";
import "./overlay/window/WindowLayer.js";
import "./overlay/message/MessageLayer.js";
import "./overlay/ctxmenu/CtxMenuLayer.js";
import TPL from "./Page.html" assert {type: "html"};
import STYLE from "./Page.css" assert {type: "css"};

export default class Page extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-page", Page);
