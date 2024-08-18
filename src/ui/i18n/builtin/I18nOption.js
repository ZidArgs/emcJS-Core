import I18nMixin from "../../mixin/I18nMixin.js";

export default class I18nOption extends I18nMixin(HTMLOptionElement) {

    set value(value) {
        if (value != null) {
            this.setAttribute("value", value);
        } else {
            this.removeAttribute("value");
        }
    }

    get value() {
        return this.getAttribute("value");
    }

    set i18nValue(value) {
        if (value != null) {
            this.setAttribute("i18n-value", value);
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
                this.label = value;
            } break;
        }
    }

    static create(value, label) {
        const el = document.createElement("option", {is: "emc-i18n-option"});
        el.value = value;
        el.i18nValue = label ?? value;
        return el;
    }

}

customElements.define("emc-i18n-option", I18nOption, {extends: "option"});
