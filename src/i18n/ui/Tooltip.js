import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import I18nMixin from "./I18nMixin.js";

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

export default class Tooltip extends I18nMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    applyI18nTranslation(content) {
        const el = this.shadowRoot.getElementById("target");
        el.title = content;
    }

}

customElements.define("emc-i18n-tooltip", Tooltip);
