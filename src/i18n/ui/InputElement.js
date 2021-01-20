import I18nMixin from "./I18nMixin.js";

export default class InputElement extends I18nMixin(HTMLInputElement) {

    applyI18nTranslation(content) {
        this.placeholder = content;
    }

}

customElements.define("emc-i18n-input", InputElement, {extends: "input"});
