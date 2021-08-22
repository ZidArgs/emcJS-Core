import Template from "../../../util/Template.js";
import GlobalStyle from "../../../util/GlobalStyle.js";

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

}

customElements.define("emc-ctxmenulayer", CtxMenuLayer);
