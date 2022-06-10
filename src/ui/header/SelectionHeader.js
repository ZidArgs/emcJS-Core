import CustomDelegatingElement from "../element/CustomDelegatingElement.js";
import "../input/SearchField.js";
import "../i18n/I18nTooltip.js";
import TPL from "./SelectionHeader.html" assert {type: "html"};
import STYLE from "./SelectionHeader.css" assert {type: "css"};

export default class SelectionHeader extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const selectionEl = this.shadowRoot.getElementById("selection");
        selectionEl.addEventListener("change", (ev) => {
            this.checked = ev.currentTarget.checked;
            const event = new Event("check");
            event.value = ev.currentTarget.checked;
            this.dispatchEvent(event);
        });
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("change", (ev) => {
            this.search = ev.currentTarget.value;
            const event = new Event("search");
            event.value = ev.currentTarget.value;
            this.dispatchEvent(event);
        });
    }

    focus() {
        const searchEl = this.shadowRoot.getElementById("search");
        if (searchEl != null) {
            searchEl.focus();
        }
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    get checked() {
        return this.getAttribute("checked");
    }

    set checked(val) {
        this.setAttribute("checked", val);
    }

    get search() {
        return this.getAttribute("search");
    }

    set search(val) {
        this.setAttribute("search", val);
    }

    get multiple() {
        return this.getAttribute("multiple") == "true";
    }

    set multiple(val) {
        this.setAttribute("multiple", val);
    }

    static get observedAttributes() {
        return ["checked", "search"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "checked": {
                    const selectionEl = this.shadowRoot.getElementById("selection");
                    if (newValue == "mixed") {
                        selectionEl.checked = true;
                        selectionEl.indeterminate = true;
                    } else {
                        selectionEl.checked = newValue != "false";
                        selectionEl.indeterminate = false;
                    }
                } break;
                case "search": {
                    const searchEl = this.shadowRoot.getElementById("search");
                    searchEl.value = newValue;
                } break;
            }
        }
    }

}

customElements.define("emc-header-selection", SelectionHeader);
