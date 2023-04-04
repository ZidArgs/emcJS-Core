import I18nMixin from "../../mixin/I18nMixin.js";

export default class I18nOption extends I18nMixin(HTMLOptionElement) {

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

    static get i18nObservedAttributes() {
        return ["i18n-value"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-value": {
                this.innerText = value;
            } break;
        }
    }

    static create() {
        return document.createElement("option", {is: "emc-i18n-option"});
    }

}

customElements.define("emc-i18n-option", I18nOption, {extends: "option"});
