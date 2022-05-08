import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomDelegatingElement from "../CustomDelegatingElement.js";
import "../input/SearchField.js";
import "../i18n/I18nTooltip.js";

const TPL = new Template(`
<emc-input-search id="search"></emc-input-search>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    padding: 3px;
    background: var(--list-color-border, #f1f1f1);
}
:host(:focus) {
    outline: none;
}
:focus {
    box-shadow: none;
    outline: none;
}
#search {
    background: var(--list-color-back, #ffffff);
    border: none;
    border-radius: 0;
}
#search:focus {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
#search:focus:not(:focus-visible)  {
    box-shadow: none;
    outline: none;
}
`);

export default class SearchHeader extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("change", ev => {
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
