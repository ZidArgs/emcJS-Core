import CustomElement from "../element/CustomElement.js";
import I18nMixin from "../mixin/I18nMixin.js";
import TPL from "./I18nTooltip.js.html" assert {type: "html"};
import STYLE from "./I18nTooltip.js.css" assert {type: "css"};

export default class I18nTooltip extends I18nMixin(CustomElement) {

    constructor() {
        super();
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

    static get i18nObservedAttributes() {
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
