import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
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

export default class I18nTooltip extends I18nMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    set i18nTooltip(val) {
        if (val != null) {
            this.setAttribute("i18n-tooltip", val);
        } else {
            this.removeAttribute("i18n-tooltip");
        }
    }

    get i18nTooltip() {
        return this.getAttribute("i18n-tooltip") || "";
    }

    static get observedI18n() {
        return ["i18n-tooltip"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-tooltip": {
                const el = this.shadowRoot.getElementById("target");
                el.title = value;
            } break;
        }
    }

}

customElements.define("emc-i18n-tooltip", I18nTooltip);
