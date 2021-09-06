import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import I18nMixin from "./I18nMixin.js";

const TPL = new Template(`
<span id="target"><slot></slot></span>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-flex;
    pointer-events: none;
    user-select: none;
    align-items: center;
    justify-content: center;
}
`);

export default class I18nLabel extends I18nMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    set i18nValue(val) {
        if (val != null) {
            this.setAttribute("i18n-value", val);
        } else {
            this.removeAttribute("i18n-value");
        }
    }

    get i18nValue() {
        return this.getAttribute("i18n-value") || "";
    }

    static get observedI18n() {
        return ["i18n-value"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-value": {
                this.innerText = value;
            } break;
        }
    }

    static getLabel(label) {
        if (label instanceof I18nLabel) {
            return label;
        } else if (label instanceof HTMLElement) {
            const el = document.createElement("emc-i18n-label");
            el.i18nValue = label.innerText;
            return el;
        } else if (typeof label === "function") {
            return I18nLabel.getLabel(label());
        } else if (typeof label !== "object") {
            const el = document.createElement("emc-i18n-label");
            el.i18nValue = label;
            return el;
        }
        return document.createElement("emc-i18n-label");
    }

}

customElements.define("emc-i18n-label", I18nLabel);
