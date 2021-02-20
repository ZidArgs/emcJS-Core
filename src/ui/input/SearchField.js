import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "../symbols/ClearSymbol.js";
import "../../i18n/ui/InputElement.js";
import "../../i18n/ui/Tooltip.js";

const TPL = new Template(`
<input id="search" is="emc-i18n-input" i18n-key="search" i18n-value="search" autocomplete="off">
<emc-i18n-tooltip i18n-key="search_reset" i18n-value="Reset search">
    <div id="search-reset">
        <emc-symbol-clear></emc-symbol-clear>
    </div>
</emc-i18n-tooltip>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex: 1;
    background: var(--list-color-back, #ffffff);
}
:focus {
    outline: none;
}
#search-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--list-color-front, #000000);
    font-size: 1.5rem;
    cursor: pointer;
}
#search {
    flex: 1;
    height: 2rem;
    padding: 0 4px;
    color: var(--list-color-front, #000000);
    background: var(--list-color-back, #ffffff);
    border: none;
    font-size: 1rem;
    -webkit-appearance: none;
    outline: none;
}
#search::placeholder {
    font-style: italic;
}
`);

export default class SearchField extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("input", ev => {
            this.value = ev.currentTarget.value;
        });
        const searchResetEl = this.shadowRoot.getElementById("search-reset");
        searchResetEl.addEventListener("click", ev => {
            this.value = "";
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static get observedAttributes() {
        return ["value"];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "value": {
                    const searchEl = this.shadowRoot.getElementById("search");
                    searchEl.value = newValue;
                    const event = new Event("change");
                    event.value = newValue;
                    this.dispatchEvent(event);
                } break;
            }
        }
    }

}

customElements.define("emc-input-search", SearchField);
