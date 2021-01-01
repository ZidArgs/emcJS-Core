import I18n from "../I18n.js";

function updateLanguage(event) {
    const key = this.i18nKey;
    if (I18n.has(key)) {
        this.applyTranslation(I18n.get(key));
    } else {
        const value = this.i18nValue;
        this.applyTranslation(value || key);
    }
}

function updateTranslation(event) {
    const key = this.i18nKey;
    if (event.changes[key] != null) {
        const value = this.i18nValue;
        this.applyTranslation(event.changes[key] || value || key);
    }
}

const LANGUAGE_HANDLER = new WeakMap();
const TRANSLATION_HANDLER = new WeakMap();

export default (CLAZZ) => class extends CLAZZ {

    constructor() {
        super();
        /* --- */
        LANGUAGE_HANDLER.set(this, updateLanguage.bind(this));
        TRANSLATION_HANDLER.set(this, updateTranslation.bind(this));
    }

    applyI18nTranslation(content) {
        // empty
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const key = this.i18nKey;
        if (I18n.has(key)) {
            this.applyI18nTranslation(I18n.get(key));
        } else {
            const value = this.i18nValue;
            this.applyI18nTranslation(value || key);
        }
        I18n.addEventListener("language", LANGUAGE_HANDLER.get(this));
        I18n.addEventListener("translation", TRANSLATION_HANDLER.get(this));
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        I18n.removeEventListener("language", LANGUAGE_HANDLER.get(this));
        I18n.removeEventListener("translation", TRANSLATION_HANDLER.get(this));
    }

    get i18nKey() {
        return this.getAttribute('i18n-key') || "";
    }

    set i18nKey(val) {
        if (val != null) {
            this.setAttribute('i18n-key', val);
        } else {
            this.removeAttribute('i18n-key');
        }
    }

    get i18nValue() {
        return this.getAttribute('i18n-value') || "";
    }

    set i18nValue(val) {
        if (val != null) {
            this.setAttribute('i18n-value', val);
        } else {
            this.removeAttribute('i18n-key');
        }
    }

    static get observedAttributes() {
        if (super.observedAttributes) {
            return [...super.observedAttributes(), 'i18n-key', 'i18n-value'];
        }
        return ['i18n-key', 'i18n-value'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (super.attributeChangedCallback) {
            super.attributeChangedCallback(name, oldValue, newValue);
        }
        if (oldValue != newValue) {
            switch (name) {
                case 'i18n-key': {
                    const key = this.i18nKey;
                    if (I18n.has(key)) {
                        this.applyI18nTranslation(I18n.get(key));
                    } else {
                        const value = this.i18nValue;
                        this.applyI18nTranslation(value || key);
                    }
                } break;
                case 'i18n-value': {
                    const key = this.i18nKey;
                    if (!I18n.has(key)) {
                        const value = this.i18nValue;
                        this.applyI18nTranslation(value || key);
                    }
                } break;
            }
        }
    }

}
