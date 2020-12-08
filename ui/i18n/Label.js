import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import I18n from "../../util/I18n.js";

const TPL = new Template(`
<span id="target"></span>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: contents;
}
`);

export default class Label extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const el = this.shadowRoot.getElementById("target");
        I18n.addEventListener("language", event => {
            if (I18n.has(this.key)) {
                el.innerHTML = I18n.get(this.key);
            } else {
                el.innerHTML = this.value || this.key;
            }
        });
        I18n.addEventListener("translation", event => {
            if (event.changes[this.key] != null) {
                el.innerHTML = event.changes[this.key] || this.value || this.key;
            }
        });
    }

    get key() {
        return this.getAttribute('key') || "";
    }

    set key(val) {
        if (typeof val == "string") {
            this.setAttribute('key', val);
        }
    }

    get value() {
        return this.getAttribute('value') || "";
    }

    set value(val) {
        if (typeof val == "string") {
            this.setAttribute('value', val);
        }
    }

    static get observedAttributes() {
        return ['key', 'value'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        const el = this.shadowRoot.getElementById("target");
        switch (name) {
            case 'key':
                if (oldValue != newValue) {
                    if (I18n.has(newValue)) {
                        el.innerHTML = I18n.get(newValue);
                    } else {
                        el.innerHTML = this.value || newValue;
                    }
                }
                break;
            case 'value':
                if (oldValue != newValue) {
                    if (!I18n.has(this.key)) {
                        el.innerHTML = newValue || this.key;
                    }
                }
                break;
        }
    }

}

customElements.define('emc-i18n-label', Label);
