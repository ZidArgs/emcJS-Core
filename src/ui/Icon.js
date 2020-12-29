import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";

const TPL = new Template(`
<div></div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-block;
    width: 20px;
    height: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
div {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    pointer-events: none;
}
`);

export default class Icon extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get src() {
        return this.getAttribute('src');
    }

    set src(val) {
        this.setAttribute('src', val);
    }

    static get observedAttributes() {
        return ['src'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'src':
                if (oldValue != newValue) {
                    this.shadowRoot.querySelector('div').style.backgroundImage = `url("${newValue}")`;
                }
                break;
        }
    }

}

customElements.define('emc-icon', Icon);
