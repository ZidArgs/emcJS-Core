import I18nMixin from "../../mixin/I18nMixin.js";

export default class I18nInput extends I18nMixin(HTMLInputElement) {

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

    set i18nPlaceholder(val) {
        if (val != null) {
            this.setAttribute("i18n-placeholder", val);
        } else {
            this.removeAttribute("i18n-placeholder");
        }
    }

    get i18nPlaceholder() {
        return this.getAttribute("i18n-placeholder") || "";
    }

    static get i18nObservedAttributes() {
        return ["i18n-value", "i18n-placeholder"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-value": {
                this.setAttribute("value", value);
            } break;
            case "i18n-placeholder": {
                this.setAttribute("placeholder", value);
            } break;
        }
    }

}

customElements.define("emc-i18n-input", I18nInput, {extends: "input"});
