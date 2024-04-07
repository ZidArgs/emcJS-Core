import Panel from "../Panel.js";
import TPL from "./TabPanel.js.html" assert {type: "html"};
import STYLE from "./TabPanel.js.css" assert {type: "css"};

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
        };
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
        } else if (name instanceof HTMLElement) {
            buttonEl.append(name);
        } else if (typeof name === "string") {
            buttonEl.innerHTML = name;
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
