import Template from "../../../util/Template.js";
import GlobalStyle from "../../../util/GlobalStyle.js";
import Panel from "../Panel.js";

const TPL = new Template(`
<div id="categories">
</div>
<div id="body">
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}
#categories {
    flex-shrink: 0;
    padding: 5px;
    overflow-x: auto;
    overflow-y: none;
    border-bottom: solid 2px #cccccc;
}
.category {
    display: inline-flex;
    margin: 0 2px;
}
.category {
    padding: 5px;
    color: var(--category-color, black);
    background-color: var(--category-background-color, white);
    border: solid 1px var(--category-color, black);
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
}
.category:hover {
    background-color: var(--category-hover-color, lightgray);
}
.category.active {
    color: var(--category-marked-color, white);
    background-color: var(--category-marked-background-color, black);
}
#body {
    flex: 1;
    overflow: hidden;
}
.panel {
    display: none;
    height: 100%;
    width: 100%;
    overflow: auto;
    word-wrap: break-word;
    resize: none;
}
.panel.active {
    display: block;
}
`);

export default class TabPanel extends Panel {
    
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const ctgrs = this.shadowRoot.getElementById("categories");
        ctgrs.onclick = (event) => {
            const targetEl = event.target.getAttribute("target");
            if (targetEl) {
                this.active = targetEl;
                event.preventDefault();
                return false;
            }
        }
    }

    connectedCallback() {
        if (!this.active) {
            const el = this.shadowRoot.querySelector("[target]");
            if (el != null) {
                this.active = el.getAttribute("target");
            }
        }
    }

    get active() {
        return this.getAttribute("active");
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    static get observedAttributes() {
        return ["active"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (oldValue) {
                const ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                if (ol != null) {
                    ol.classList.remove("active");
                }
                const ob = this.shadowRoot.querySelector(`[target="${oldValue}"]`);
                if (ob != null) {
                    ob.classList.remove("active");
                }
            }
            const nl = this.shadowRoot.getElementById(`panel_${newValue}`);
            if (nl != null) {
                nl.classList.add("active");
            }
            const nb = this.shadowRoot.querySelector(`[target="${newValue}"]`);
            if (nb != null) {
                nb.classList.add("active");
            }
        }
    }

    addTab(category, name = category) {
        const pnlId = `panel_${category}`;
        const btnId = `button_${category}`;
        const former = this.shadowRoot.getElementById(btnId);
        if (former == null) {
            // panel
            const pnl = document.createElement("div");
            pnl.id = pnlId;
            pnl.className = "panel";
            pnl.setAttribute("category", category);
            this.shadowRoot.getElementById("body").append(pnl);
            // button
            const cb = document.createElement("div");
            cb.id = btnId;
            cb.className = "category";
            cb.setAttribute("target", category);
            if (name instanceof HTMLElement) {
                cb.append(name);
            } else if (typeof name === "string") {
                cb.innerHTML = name;
            }
            this.shadowRoot.getElementById("categories").append(cb);
            // ---
            return pnl;
        } else {
            throw new Error(`categoty "${category}" already exists`);
        }
    }

    getTab(category) {
        const pnlId = `panel_${category}`;
        const panel = this.shadowRoot.getElementById(pnlId);
        if (panel != null) {
            return panel;
        }
    }

}

customElements.define("emc-panel-tabpanel", TabPanel);
