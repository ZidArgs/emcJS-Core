import CustomElement from "../element/CustomElement.js";
import I18nMixin from "../mixin/I18nMixin.js";
import TPL from "./I18nTextbox.html" assert {type: "html"};
import STYLE from "./I18nTextbox.css" assert {type: "css"};

export default class I18nTextbox extends I18nMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    set i18nContent(val) {
        if (val != null) {
            this.setAttribute("i18n-content", val);
        } else {
            this.removeAttribute("i18n-content");
        }
    }

    get i18nContent() {
        return this.getAttribute("i18n-content") || "";
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
        return ["i18n-content", "i18n-tooltip"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-content": {
                this.innerText = value;
            } break;
            case "i18n-tooltip": {
                const el = this.shadowRoot.getElementById("target");
                el.title = value;
            } break;
        }
    }

}

customElements.define("emc-i18n-textbox", I18nTextbox);
