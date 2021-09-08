import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import Panel from "../Panel.js";

const TPL = new Template(`
<div id="categories">
</div>
<div id="body">
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
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
    user-select: none;
}
.category {
    display: inline-flex;
    margin: 0 2px;
    padding: 5px;
    color: var(--category-color, black);
    background-color: var(--category-background-color, white);
    border: solid 1px var(--category-color, black);
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
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
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const ctgrs = this.shadowRoot.getElementById("categories");
        ctgrs.onclick = (event) => {
            const targetEl = event.target.getAttribute("target");
            if (targetEl != null) {
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
            switch (name) {
                case "active": {
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
                    } else {
                        const el = this.shadowRoot.querySelector("[target]");
                        if (el != null) {
                            this.active = el.getAttribute("target");
                        }
                    }
                } break;
            }
        }
    }

    setTab(category, name = category) {
        const panelId = `panel_${category}`;
        const buttonId = `button_${category}`;
        const buttonEl = this.shadowRoot.getElementById(buttonId);
        if (buttonEl == null) {
            // panel
            const panelEl = document.createElement("div");
            panelEl.id = panelId;
            panelEl.className = "panel";
            panelEl.setAttribute("category", category);
            this.shadowRoot.getElementById("body").append(panelEl);
            // button
            const buttonEl = document.createElement("button");
            buttonEl.id = buttonId;
            buttonEl.className = "category";
            buttonEl.setAttribute("target", category);
            if (name instanceof HTMLElement) {
                buttonEl.append(name);
            } else if (typeof name === "string") {
                buttonEl.innerHTML = name;
            }
            const buttonWrapperEl = document.createElement("emc-input-wrapper");
            buttonWrapperEl.append(buttonEl);
            this.shadowRoot.getElementById("categories").append(buttonWrapperEl);
            // ---
            return panelEl;
        } else {
            if (name instanceof HTMLElement) {
                buttonEl.append(name);
            } else if (typeof name === "string") {
                buttonEl.innerHTML = name;
            }
        }
    }

    getTab(category) {
        const panelId = `panel_${category}`;
        const panelEl = this.shadowRoot.getElementById(panelId);
        if (panelEl != null) {
            return panelEl;
        }
    }

    hasTab(category) {
        const panelId = `panel_${category}`;
        const panelEl = this.shadowRoot.getElementById(panelId);
        return panelEl != null;
    }

}

customElements.define("emc-panel-tabpanel", TabPanel);
