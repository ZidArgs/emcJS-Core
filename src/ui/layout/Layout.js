import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "./HBox.js";
import "./VBox.js";
import Panel from "./Panel.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    justify-content: stretch;
    align-items: stretch;
}
::slotted(:not(:first-child)) {
    display: none;
}
::slotted(.panel) {
    padding: 5px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color, #ffffff);
    overflow: hidden;
}
`);

function loadLayout(layout) {
    if (layout) {
        if (layout.type == "panel") {
            const el = document.createElement('div');
            el.classList.add("panel");
            const ch = new (Panel.getReference(layout.name));
            for (const i in layout.options) {
                ch.setAttribute(i, layout.options[i]);
            }
            el.append(ch);
            return el;
        } else {
            const el = document.createElement(`emc-${layout.type}`);
            el.classList.add("stretchlast");
            for (const item of layout.items) {
                const ch = loadLayout(item);
                if (item.autosize) {
                    ch.classList.add("autosize");
                    el.classList.remove("stretchlast");
                }
                el.append(ch);
            }
            return el;
        }
    }
}

export default class Layout extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    loadLayout(layout) {
        this.innerHTML = "";
        if (!layout) return;
        this.appendChild(loadLayout(layout));
    }

}

customElements.define('emc-layout', Layout);
