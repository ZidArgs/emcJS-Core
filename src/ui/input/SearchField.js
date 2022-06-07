import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomDelegatingElement from "../CustomDelegatingElement.js";
import "../symbols/ClearSymbol.js";
import "./InputElement.js";
import "../i18n/I18nTooltip.js";

const TPL = new Template(`
<input id="search" is="emc-input" i18n-value="search..." autocomplete="off">
<emc-i18n-tooltip i18n-tooltip="Reset search">
    <div id="search-reset" class="button">
        <emc-symbol-clear></emc-symbol-clear>
    </div>
</emc-i18n-tooltip>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex: 1;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    border: solid 1px var(--input-border-color, #000000);
    border-radius: 2px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
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
    outline: none;
}
.button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    font-size: 1.5rem;
    cursor: pointer;
}
#search {
    flex: 1;
    height: 2rem;
    padding: 0 4px;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    border: none;
    font-size: 1rem;
    -webkit-appearance: none;
    outline: none;
}
#search::placeholder {
    font-style: italic;
}
`);

export default class SearchField extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("input", (ev) => {
            this.value = ev.currentTarget.value;
        });
        const searchResetEl = this.shadowRoot.getElementById("search-reset");
        searchResetEl.addEventListener("click", () => {
            this.value = "";
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    get value() {
        return this.getAttribute("value") ?? "";
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
