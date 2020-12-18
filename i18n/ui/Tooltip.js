import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import I18n from "../I18n.js";

const TPL = new Template(`
<slot id="target"></slot>
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

function updateLanguage(event) {
    const el = this.shadowRoot.getElementById("target");
    if (I18n.has(this.key)) {
        el.title = I18n.get(this.key);
    } else {
        el.title = this.value || this.key;
    }
}

function updateTranslation(event) {
    const el = this.shadowRoot.getElementById("target");
    if (event.changes[this.key] != null) {
        el.title = event.changes[this.key] || this.value || this.key;
    }
}

const LANGUAGE_HANDLER = new WeakMap();
const TRANSLATION_HANDLER = new WeakMap();

export default class Tooltip extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        LANGUAGE_HANDLER.set(this, updateLanguage.bind(this));
        TRANSLATION_HANDLER.set(this, updateTranslation.bind(this));
    }

    connectedCallback() {
        const el = this.shadowRoot.getElementById("target");
        if (I18n.has(this.key)) {
            el.title = I18n.get(this.key);
        } else {
            el.title = this.value || this.key;
        }
        I18n.addEventListener("language", LANGUAGE_HANDLER.get(this));
        I18n.addEventListener("translation", TRANSLATION_HANDLER.get(this));
    }

    disconnectedCallback() {
        I18n.removeEventListener("language", LANGUAGE_HANDLER.get(this));
        I18n.removeEventListener("translation", TRANSLATION_HANDLER.get(this));
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
                        el.title = I18n.get(newValue);
                    } else {
                        el.title = this.value || newValue;
                    }
                }
                break;
            case 'value':
                if (oldValue != newValue) {
                    if (!I18n.has(this.key)) {
                        el.title = newValue || this.key;
                    }
                }
                break;
        }
    }

}

customElements.define('emc-i18n-tooltip', Tooltip);
