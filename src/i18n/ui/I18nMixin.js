import {createMixin} from "../../util/Mixin.js";
import I18n from "../I18n.js";
import EventTargetManager from "../../event/EventTargetManager.js";

const MANAGER = new WeakMap();
const ATTR = new WeakMap();

export default createMixin((superclass) => class I18nMixin extends superclass {

    constructor(...args) {
        super(...args);
        /* --- */
        const i18nAttr = new.target.observedI18n;
        ATTR.set(this, i18nAttr);
        const manager = new EventTargetManager(I18n);
        manager.set("language", () => {
            for (const attr of i18nAttr) {
                const key = this.getAttribute(attr);
                if (key) {
                    this.applyI18n(attr, I18n.get(key));
                }
            }
        });
        manager.set("translation", event => {
            for (const attr of i18nAttr) {
                const key = this.getAttribute(attr);
                if (key && event.changes[key] != null) {
                    this.applyI18n(attr, event.changes[key]);
                }
            }
        });
        MANAGER.set(this, manager);
    }

    applyI18n(key, value) {
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
        const i18nAttr = ATTR.get(this);
        for (const attr of i18nAttr) {
            const key = this.getAttribute(attr);
            if (key) {
                this.applyI18n(attr, I18n.get(key));
            } else {
                this.applyI18n(attr, "");
            }
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

    static get observedI18n() {
        return [];
    }

    static get observedAttributes() {
        if (super.observedAttributes) {
            return [...super.observedAttributes, ...this.observedI18n];
        }
        return this.observedI18n;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (super.attributeChangedCallback) {
            super.attributeChangedCallback(name, oldValue, newValue);
        }
        const i18nAttr = ATTR.get(this);
        if (oldValue != newValue && i18nAttr.includes(name)) {
            if (newValue) {
                this.applyI18n(name, I18n.get(newValue));
            } else {
                this.applyI18n(name, "");
            }
        }
    }

});
