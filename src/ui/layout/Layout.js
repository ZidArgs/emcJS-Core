import CustomElement from "../element/CustomElement.js";
import "./panel/HBox.js";
import "./panel/VBox.js";
import "./panel/TabPanel.js";
import Panel from "./Panel.js";
import TPL from "./Layout.html" assert {type: "html"};
import STYLE from "./Layout.css" assert {type: "css"};

function renderLayout(layout) {
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
                const ch = renderLayout(item);
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
                    const ch = renderLayout(cat);
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

export default class Layout extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    loadLayout(layout) {
        this.innerHTML = "";
        if (!layout) {
            return;
        }
        const rendered = renderLayout(layout)
        this.appendChild(rendered);
    }

}

customElements.define("emc-layout", Layout);
