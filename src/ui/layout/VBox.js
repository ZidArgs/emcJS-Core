import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

const TPL = new Template(`
<slot>
</slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: min-content;
    min-width: min-content;
}
:host > ::slotted(*) {
    flex-grow: 0;
    flex-shrink: 0;
}
:host(.stretchlast) > ::slotted(:last-child),
:host > ::slotted(.autosize) {
    flex-grow: 1;
    flex-shrink: 1;
}
:host > ::slotted(.panel) {
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color, #ffffff);
    overflow: hidden;
}
`);

export default class VBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define('emc-vbox', VBox);
