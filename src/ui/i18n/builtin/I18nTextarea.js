import I18nMixin from "../../mixin/I18nMixin.js";

export default class I18nTextarea extends I18nMixin(HTMLTextAreaElement) {

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

    static get observedI18n() {
        return ["i18n-placeholder"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-placeholder": {
                this.setAttribute("placeholder", value);
            } break;
        }
    }

}

customElements.define("emc-i18n-textarea", I18nTextarea, {extends: "textarea"});
