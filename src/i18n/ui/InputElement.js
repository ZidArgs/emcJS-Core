import I18nMixin from "./I18nMixin.js";

/**
 * usage:
 * ```html
 * <input is="emc-i18n-input" type="text" i18nKey="translation.placeholder.key" i18nValue="default placeholder">
 * ```
 */
export default class InputElement extends I18nMixin(HTMLInputElement) {

    applyI18nTranslation(content) {
        this.placeholder = content;
    }

}

customElements.define("emc-i18n-input", InputElement, {extends: "input"});
