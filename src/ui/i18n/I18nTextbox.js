import CustomElement from "../element/CustomElement.js";
import I18nMixin from "../mixin/I18nMixin.js";
import TPL from "./I18nTextbox.js.html" assert {type: "html"};
import STYLE from "./I18nTextbox.js.css" assert {type: "css"};

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

    static get i18nObservedAttributes() {
        return ["i18n-content", "i18n-tooltip"];
    }

    static get i18nMultilineAttributes() {
        return ["i18n-content"];
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

    get comparatorText() {
        return this.innerText;
    }

}

customElements.define("emc-i18n-textbox", I18nTextbox);
