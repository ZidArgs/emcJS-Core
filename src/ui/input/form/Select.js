import Template from "../../../util/Template.js";
import GlobalStyle from "../../../util/GlobalStyle.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    height: 2em;
    color: var(--primary-color-front, #000000);
    background: var(--primary-color-back, #ffffff);
    border-radius: 2px;
    border: solid 1px var(--primary-color-border, #000000);
}

:host:hover {
    background: var(--primary-color-marked, #eeeeee);
}
`);

export default class Select extends HTMLSelectElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define('emc-select', Select);
