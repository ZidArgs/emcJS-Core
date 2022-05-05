import {
    createMixin
} from "../../util/Mixin.js";
import I18n from "../../util/I18n.js";
import EventTargetManager from "../../util/event/EventTargetManager.js";

export default createMixin((superclass) => class I18nMixin extends superclass {

    #manager = new EventTargetManager(I18n);

    #observedI18nAttr;

    constructor(...args) {
        super(...args);
        /* --- */
        this.#observedI18nAttr = new.target.observedI18n;
        this.#manager = new EventTargetManager(I18n);
        this.#manager.set("language", () => {
            for (const attr of this.#observedI18nAttr) {
                const key = this.getAttribute(attr);
                if (key) {
                    this.applyI18n(attr, I18n.get(key));
                }
            }
        });
        this.#manager.set("translation", event => {
            for (const attr of this.#observedI18nAttr) {
                const key = this.getAttribute(attr);
                if (key && event.changes[key] != null) {
                    this.applyI18n(attr, event.changes[key]);
                }
            }
        });
    }

    applyI18n(key, value) {
        // empty
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        this.#manager.setActive(true);
        /* --- */
        for (const attr of this.#observedI18nAttr) {
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
        this.#manager.setActive(false);
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
                this.applyI18n(name, I18n.get(newValue));
            } else {
                this.applyI18n(name, "");
            }
        }
    }

});
