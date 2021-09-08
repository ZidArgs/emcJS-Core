import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import CustomElement from "../../CustomElement.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex-direction: row;
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

export default class HBox extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-panel-hbox", HBox);
