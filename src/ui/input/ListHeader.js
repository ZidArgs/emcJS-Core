import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "../../i18n/ui/InputElement.js";
import "../../i18n/ui/Tooltip.js";

const TPL = new Template(`
<input type="checkbox" id="selection" tabindex="-1">
<div id="search-wrapper">
    <input id="search" is="emc-i18n-input" i18n-key="search" i18n-value="search" autocomplete="off">
    <emc-i18n-tooltip i18n-key="search_reset" i18n-value="Reset search">
        <div id="search-reset">⨯</div>
    </emc-i18n-tooltip>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    padding: 2px 0;
    background: var(--list-color-border, #f1f1f1);
}
:focus {
    outline: none;
}
#search-wrapper {
    display: flex;
    flex: 1;
    background: var(--list-color-back, #ffffff);
}
#search-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--list-color-front, #000000);
    font-size: 20px;
    font-weight: bold;
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
#selection {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 7px;
    cursor: pointer;
    -webkit-appearance: none;
    outline: none;
}
#selection::before {
    font-size: 18px;
    content: "\u2610";
}
#selection:indeterminate::before {
    content: "\u2612";
}
#selection:checked::before {
    content: "\u2611";
}
`);

export default class ListHeader extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
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
        searchEl.addEventListener("input", ev => {
            this.search = ev.currentTarget.value;
            const event = new Event("search");
            event.value = ev.currentTarget.value;
            this.dispatchEvent(event);
        });
        const searchResetEl = this.shadowRoot.getElementById("search-reset");
        searchResetEl.addEventListener("click", ev => {
            this.search = "";
            const event = new Event("search");
            event.value = "";
            this.dispatchEvent(event);
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
        /* --- */
        const selection = this.shadowRoot.getElementById("selection");
        if (!this.multiple) {
            selection.style.display = "none";
        } else {
            selection.style.display = "";
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
        return ["checked", "search", "multiple"];
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
                case "multiple": {
                    const selectionEl = this.shadowRoot.getElementById("selection");
                    if (newValue != "true") {
                        selectionEl.style.display = "none";
                    } else {
                        selectionEl.style.display = "";
                    }
                } break;
            }
        }
    }

}

customElements.define("emc-listheader", ListHeader);
