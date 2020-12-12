import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import "../i18n/Tooltip.js";

const TPL = new Template(`
<emc-i18n-tooltip id="tooltip">
    <button>
        <div id="bar1"></div>
        <div id="bar2"></div>
        <div id="bar3"></div>
    </button>
</emc-i18n-tooltip>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-block;
    width: 40px;
    height: 40px;
    padding: 0px;
}
button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0;
    background-color: var(--navigation-background-color, #ffffff);
    cursor: pointer;
    outline: none;
    appearance: none;
}
button:hover {
    box-shadow: inset 0px 0px 2px 1px;
}
button:active {
    box-shadow: inset 0px 0px 4px 3px;
}
div {
    position: absolute;
    width: 30px;
    height: 4px;
    top: 18px;
    left: 5px;
    background-color: var(--navigation-text-color, #000000);
    transition: transform 0.2s ease-in-out;
}
#bar1 {
    transform: translateY(-8px);
}
#bar2 {
    transform-origin: left;
}
#bar3 {
    transform: translateY(8px);
}
:host([open]:not([open="false"])) #bar1 {
    transform: rotate(45deg);
}
:host([open]:not([open="false"])) #bar2 {
    transform: scaleX(0);
}
:host([open]:not([open="false"])) #bar3 {
    transform: rotate(-45deg);
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

    get open() {
        return this.getAttribute('open');
    }

    set open(val) {
        this.setAttribute('open', val);
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
        return ['tooltip', 'i18n-tooltip'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        const tooltip = this.shadowRoot.getElementById("tooltip");
        switch (name) {
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

customElements.define('emc-navbar-hamburger', Button);
