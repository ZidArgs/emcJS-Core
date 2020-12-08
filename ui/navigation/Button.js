import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "../i18n/Label.js";
import "../i18n/Tooltip.js";

const TPL = new Template(`
<emc-i18n-tooltip id="tooltip">
    <button>
        <emc-i18n-label id="label"></emc-i18n-label>
    </button>
</emc-i18n-tooltip>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
}
button {
    display: flex;
    justify-content: var(--justify-content, center);
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 10px;
    border: none;
    border-radius: 0;
    background-color: var(--navigation-background-color, #ffffff);
    color: var(--navigation-text-color, #000000);
    font-weight: bold;
    font-size: 1em;
    text-align: center;
    cursor: pointer;
    outline: none;
    text-decoration: none;
    appearance: none;
    user-select: none;
    white-space: pre;
}
button:hover {
    box-shadow: inset 0px 0px 2px 1px;
}
button:active {
    box-shadow: inset 0px 0px 4px 3px;
}
button:disabled {
    opacity: 0.3;
}
:host([expand="closed"]) button:before,
:host([expand="open"]) button:before {
    display: block;
    width: 11px;
    height: 8px;
    box-sizing: border-box;
    border-top: solid transparent 4px;
    border-left: solid var(--navigation-text-color, #000000) 6px;
    border-bottom: solid transparent 4px;
    border-right: solid transparent 0px;
    transition: transform 0.2s ease-in-out;
    transform-origin: 3px 4px;
    content: "";
}
:host([expand="open"]) button:before {
    transform: rotate(90deg);
}
`);

export default class Button extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get expand() {
        return this.getAttribute('expand');
    }

    set expand(val) {
        if (val == "open" || val == "closed") {
            this.setAttribute('expand', val);
        } else {
            this.removeAttribute('expand');
        }
    }

    get content() {
        return this.getAttribute('content');
    }

    set content(val) {
        this.setAttribute('content', val);
    }

    get i18nContent() {
        return this.getAttribute('i18n-content');
    }

    set i18nContent(val) {
        this.setAttribute('i18n-content', val);
    }

    get tooltip() {
        return this.getAttribute('tooltip');
    }

    set tooltip(val) {
        this.setAttribute('tooltip', val);
    }

    get i18nTooltip() {
        return this.getAttribute('i18n-tooltip');
    }

    set i18nTooltip(val) {
        this.setAttribute('i18n-tooltip', val);
    }

    static get observedAttributes() {
        return ['content', 'i18n-content', 'tooltip', 'i18n-tooltip'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        const tooltip = this.shadowRoot.getElementById("tooltip");
        const label = this.shadowRoot.getElementById("label");
        switch (name) {
            case 'content':
                if (oldValue != newValue) {
                    label.value = newValue;
                }
                break;
            case 'i18n-content':
                if (oldValue != newValue) {
                    label.key = newValue;
                }
                break;
            case 'tooltip':
                if (oldValue != newValue) {
                    tooltip.value = newValue;
                }
                break;
            case 'i18n-tooltip':
                if (oldValue != newValue) {
                    tooltip.key = newValue;
                }
                break;
        }
    }

}

customElements.define('emc-navbar-button', Button);