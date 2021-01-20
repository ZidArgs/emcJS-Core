import {registerMixin} from "../../util/Mixin.js";
import I18n from "../I18n.js";
import EventTargetManager from "../../event/EventTargetManager.js";

const MANAGER = new WeakMap();

export default registerMixin((superclass) => class I18nMixin extends superclass {

    constructor() {
        super();
        /* --- */
        const manager = new EventTargetManager(I18n);
        manager.set("language", event => {
            const key = this.i18nKey;
            if (I18n.has(key)) {
                this.applyTranslation(I18n.get(key));
            } else {
                const value = this.i18nValue;
                this.applyTranslation(value || key);
            }
        });
        manager.set("translation", event => {
            const key = this.i18nKey;
            if (event.changes[key] != null) {
                const value = this.i18nValue;
                this.applyTranslation(event.changes[key] || value || key);
            }
        });
        MANAGER.set(this, manager);
    }

    applyI18nTranslation(content) {
        // empty
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        const manager = MANAGER.get(this);
        manager.setActive(true);
        /* --- */
        const key = this.i18nKey;
        if (I18n.has(key)) {
            this.applyI18nTranslation(I18n.get(key));
        } else {
            const value = this.i18nValue;
            this.applyI18nTranslation(value || key);
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        /* --- */
        const manager = MANAGER.get(this);
        manager.setActive(false);
    }

    get i18nKey() {
        return this.getAttribute("i18n-key") || "";
    }

    set i18nKey(val) {
        if (val != null) {
            this.setAttribute("i18n-key", val);
        } else {
            this.removeAttribute("i18n-key");
        }
    }

    get i18nValue() {
        return this.getAttribute("i18n-value") || "";
    }

    set i18nValue(val) {
        if (val != null) {
            this.setAttribute("i18n-value", val);
        } else {
            this.removeAttribute("i18n-key");
        }
    }

    static get observedAttributes() {
        if (super.observedAttributes) {
            return [...super.observedAttributes(), "i18n-key", "i18n-value"];
        }
        return ["i18n-key", "i18n-value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (super.attributeChangedCallback) {
            super.attributeChangedCallback(name, oldValue, newValue);
        }
        if (oldValue != newValue) {
            switch (name) {
                case "i18n-key": {
                    const key = this.i18nKey;
                    if (I18n.has(key)) {
                        this.applyI18nTranslation(I18n.get(key));
                    } else {
                        const value = this.i18nValue;
                        this.applyI18nTranslation(value || key);
                    }
                } break;
                case "i18n-value": {
                    const key = this.i18nKey;
                    if (!I18n.has(key)) {
                        const value = this.i18nValue;
                        this.applyI18nTranslation(value || key);
                    }
                } break;
            }
        }
    }

});
