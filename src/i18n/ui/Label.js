import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import I18nMixin from "./I18nMixin.js";

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
    pointer-events: none;
    user-select: none;
}
`);

export default class Label extends I18nMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    applyI18nTranslation(content) {
        const el = this.shadowRoot.getElementById("target");
        el.innerHTML = content;
    }

}

customElements.define("emc-i18n-label", Label);
