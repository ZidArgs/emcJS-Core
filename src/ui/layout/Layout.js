import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "./panel/HBox.js";
import "./panel/VBox.js";
import "./panel/TabPanel.js";
import Panel from "./Panel.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    min-height: 100%;
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
::slotted(.error-panel) {
    padding: 10px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color, #ffffff);
    overflow: hidden;
}
`);

function loadLayout(layout) {
    if (layout != null) {
        if (layout.type == "panel") {
            const clazz = Panel.getReference(layout.name);
            if (clazz != null) {
                const el = new clazz();
                el.classList.add("panel");
                for (const i in layout.options) {
                    el.setAttribute(i, layout.options[i]);
                }
                return el;
            } else {
                const el = document.createElement("div");
                el.classList.add("error-panel");
                el.innerHTML = `error: panel with reference name "${layout.name}" not found`;
                return el;
            }
        } else if (layout.type == "vbox" || layout.type == "hbox") {
            const el = document.createElement(`emc-panel-${layout.type}`);
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
        } else if (layout.type == "tabpanel") {
            const el = document.createElement("emc-panel-tabpanel");
            for (const cat of layout.categories) {
                const cnt = el.addTab(cat.category, cat.name ?? cat.category);
                for (const item of cat.items) {
                    const ch = loadLayout(cat);
                    if (item.autosize) {
                        ch.classList.add("autosize");
                    }
                    cnt.append(ch);
                }
            }
            return el;
        } else {
            const el = document.createElement("div");
            el.classList.add("error-panel");
            el.innerHTML = `error: panel type "${layout.type}" not found`;
            return el;
        }
    } else {
        const el = document.createElement("div");
        el.classList.add("error-panel");
        el.innerHTML = `error: no layout found`;
        return el;
    }
}

export default class Layout extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
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

customElements.define("emc-layout", Layout);
