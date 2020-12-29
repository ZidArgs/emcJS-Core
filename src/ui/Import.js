import Import from "../util/Import.js";
import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: content;
}
`);

function appendHTML(r) {
    while (r.length > 0) {
        this.append(r[0]);
    }
}

export default class HTMLImport extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get style() {
        return this.getAttribute('style');
    }

    set style(val) {
        this.setAttribute('style', val);
    }

    get html() {
        return this.getAttribute('html');
    }

    set html(val) {
        this.setAttribute('html', val);
    }

    get module() {
        return this.getAttribute('module');
    }

    set module(val) {
        this.setAttribute('module', val);
    }

    static get observedAttributes() {
        return ['style', 'html', 'module'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'style':
                if (oldValue != newValue) {
                    Import.addStyle(newValue);
                }
                break;
            case 'html':
                if (oldValue != newValue) {
                    Import.html(newValue).then(appendHTML.bind(this));
                }
                break;
            case 'module':
                if (oldValue != newValue) {
                    Import.addModule(newValue);
                }
                break;
        }
    }

}

customElements.define('emc-import', HTMLImport);
