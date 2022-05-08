import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomDelegatingElement from "../CustomDelegatingElement.js";
import "../input/SearchField.js";
import "../i18n/I18nTooltip.js";

const TPL = new Template(`
<input type="checkbox" id="selection" tabindex="-1">
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
#selection {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 6px;
    cursor: pointer;
    -webkit-appearance: none;
    outline: none;
}
#selection::before {
    font-size: 18px;
    content: "\u2610";
}
#selection:indeterminate::before {
    content: "\u2BBD";
}
#selection:checked::before {
    content: "\u2611";
}
:host(:not([multiple])) #selection,
:host([multiple="false"]) #selection {
    opacity: 0.1;
    pointer-events: none;
}
`);

export default class SelectionHeader extends CustomDelegatingElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const selectionEl = this.shadowRoot.getElementById("selection");
        selectionEl.addEventListener("change", ev => {
            this.checked = ev.currentTarget.checked;
            const event = new Event("check");
            event.value = ev.currentTarget.checked;
            this.dispatchEvent(event);
        });
        const searchEl = this.shadowRoot.getElementById("search");
        searchEl.addEventListener("change", ev => {
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
