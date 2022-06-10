import CustomDelegatingElement from "../element/CustomDelegatingElement.js";
import "../input/SearchField.js";
import "../i18n/I18nTooltip.js";
import TPL from "./SearchHeader.html" assert {type: "html"};
import STYLE from "./SearchHeader.css" assert {type: "css"};

export default class SearchHeader extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("change", (ev) => {
            this.search = ev.currentTarget.value;
            const event = new Event("search");
            event.value = ev.currentTarget.value;
            this.dispatchEvent(event);
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    get search() {
        return this.getAttribute("search");
    }

    set search(val) {
        this.setAttribute("search", val);
    }

    static get observedAttributes() {
        return ["search"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "search": {
                    const searchEl = this.shadowRoot.getElementById("search");
                    searchEl.value = newValue;
                } break;
            }
        }
    }

}

customElements.define("emc-header-search", SearchHeader);
