import {
    isStringNotEmpty
} from "../../../util/helper/CheckType.js";
import Panel from "../Panel.js";
import "../../form/button/Button.js";
import TPL from "./TabPanel.js.html" assert {type: "html"};
import STYLE from "./TabPanel.js.css" assert {type: "css"};

export default class TabPanel extends Panel {

    #categoryEl;

    #panelList = new Map();

    #buttonList = new Map();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#categoryEl = this.shadowRoot.getElementById("categories");
        this.#categoryEl.onclick = (event) => {
            const targetEl = event.target.getAttribute("target");
            if (targetEl != null) {
                this.active = targetEl;
                event.preventDefault();
                return false;
            }
        };
    }

    connectedCallback() {
        this.#prepareTabs();
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
                        const oldPanel = this.#panelList.get(oldValue);
                        if (oldPanel != null) {
                            oldPanel.classList.remove("active");
                        }
                        const oldButton = this.#buttonList.get(oldValue);
                        if (oldButton != null) {
                            oldButton.classList.remove("active");
                        }
                    }
                    const newPanel = this.#panelList.get(newValue);
                    if (newPanel != null) {
                        newPanel.classList.add("active");
                    }
                    const newButton = this.#buttonList.get(newValue);
                    if (newButton != null) {
                        newButton.classList.add("active");
                        const ev = new Event("change");
                        ev.panel = newValue;
                        this.dispatchEvent(ev);
                    } else {
                        const firstButton = this.shadowRoot.querySelector("[target]");
                        if (firstButton != null) {
                            this.active = firstButton.getAttribute("target");
                        }
                    }
                } break;
            }
        }
    }

    addTab(category, name = category) {
        if (!isStringNotEmpty(category)) {
            throw new Error("category must be an unempty string");
        }
        if (!isStringNotEmpty(name)) {
            throw new Error("optional name must be an unempty string");
        }
        const panelId = `panel_${category}`;
        const buttonEl = this.#buttonList.get(category);
        if (buttonEl == null) {
            // panel
            const panelEl = this.#panelList.get(category) ?? document.createElement("div");
            panelEl.id = panelId;
            panelEl.className = "panel";
            if (category === this.active) {
                panelEl.classList.add("active");
            }
            panelEl.setAttribute("category", category);
            this.#panelList.set(category, panelEl);
            this.append(panelEl);
            // button
            this.#addTabButton(category, name);
            // ---
            return panelEl;
        } else {
            buttonEl.text = name;
        }
    }

    getTab(category) {
        return this.#panelList.get(category);
    }

    hasTab(category) {
        return this.#panelList.has(category);
    }

    #prepareTabs() {
        const panelElList = this.querySelectorAll(`:scope > div[category]`);
        for (const panelEl of panelElList) {
            const category = panelEl.getAttribute("category");
            if (isStringNotEmpty(category)) {
                this.#panelList.set(category, panelEl);
                const panelId = `panel_${category}`;
                panelEl.id = panelId;
                panelEl.className = "panel";
                if (category === this.active) {
                    panelEl.classList.add("active");
                }
                const buttonEl = this.#buttonList.get(category);
                if (buttonEl == null) {
                    this.#addTabButton(category, category);
                } else {
                    this.#categoryEl.append(buttonEl);
                }
            }
        }
    }

    #addTabButton(category, name) {
        const buttonId = `button_${category}`;
        const buttonEl = document.createElement("emc-button");
        buttonEl.id = buttonId;
        buttonEl.className = "category";
        buttonEl.setAttribute("target", category);
        buttonEl.text = name;
        this.#buttonList.set(category, buttonEl);
        this.#categoryEl.append(buttonEl);
    }

}

customElements.define("emc-panel-tabpanel", TabPanel);
