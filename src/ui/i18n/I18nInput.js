import I18nMixin from "../mixin/I18nMixin.js";

export default class I18nInput extends I18nMixin(HTMLInputElement) {

    #value = "";

    set template(value) {
        this.setAttribute("template", value);
    }

    get template() {
        return this.getAttribute("template");
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
        return ["i18n-value", "i18n-placeholder"];
    }

    applyI18n(key, value) {
        switch (key) {
            case "i18n-value": {
                this.#value = value;
                this.value = this.#getValue();
            } break;
            case "i18n-placeholder": {
                this.setAttribute("placeholder", value);
            } break;
        }
    }

    #getValue() {
        if (typeof this.template === "string" && this.template !== "") {
            return this.template.replace(/\{\{value\}\}/g, this.#value);
        } else {
            return this.#value;
        }
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "template"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "template": {
                if (oldValue != newValue) {
                    this.value = this.#getValue();
                }
            } break;
        }
        super.attributeChangedCallback(name, oldValue, newValue);
    }

}

customElements.define("emc-i18n-input", I18nInput, {extends: "input"});
