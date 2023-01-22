import {
    createMixin
} from "../../util/Mixin.js";
import i18n from "../../util/I18n.js";
import EventTargetManager from "../../util/event/EventTargetManager.js";

export default createMixin((superclass) => class I18nMixin extends superclass {

    #i18nEventManager = new EventTargetManager(i18n);

    #observedI18nAttr;

    constructor(...args) {
        super(...args);
        /* --- */
        this.#observedI18nAttr = new.target.observedI18n;
        this.#i18nEventManager = new EventTargetManager(i18n);
        this.#i18nEventManager.set("language", () => {
            for (const attr of this.#observedI18nAttr) {
                const key = this.getAttribute(attr);
                if (key) {
                    this.applyI18n(attr, i18n.get(key));
                }
            }
        });
        this.#i18nEventManager.set("translation", (event) => {
            for (const attr of this.#observedI18nAttr) {
                const key = this.getAttribute(attr);
                if (key && event.changes[key] != null) {
                    this.applyI18n(attr, event.changes[key]);
                }
            }
        });
    }

    applyI18n(/* key, value */) {
        // empty
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        this.#i18nEventManager.setActive(true);
        /* --- */
        for (const attr of this.#observedI18nAttr) {
            const key = this.getAttribute(attr);
            if (key) {
                this.applyI18n(attr, i18n.get(key));
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
        this.#i18nEventManager.setActive(false);
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
        if (oldValue != newValue && this.#observedI18nAttr.includes(name)) {
            if (newValue) {
                this.applyI18n(name, i18n.get(newValue));
            } else {
                this.applyI18n(name, "");
            }
        }
    }

});
