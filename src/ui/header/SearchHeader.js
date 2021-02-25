import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "../input/SearchField.js";
import "../../i18n/ui/InputElement.js";
import "../../i18n/ui/Tooltip.js";

const TPL = new Template(`
<emc-input-search id="search"></emc-input-search>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    padding: 2px 0;
    background: var(--list-color-border, #f1f1f1);
}
:host(:focus) {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
:host(:focus:not(:focus-visible)) {
    box-shadow: none;
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
`);

export default class SearchHeader extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
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
