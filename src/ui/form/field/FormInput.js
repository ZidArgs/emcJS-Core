import CustomElementDelegating from "../../element/CustomElementDelegating.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "./FormInput.js.html" assert {type: "html"};
import STYLE from "./FormInput.js.css" assert {type: "css"};

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

export default class FormInput extends CustomElementDelegating {

    #errorText = "";

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const resetEl = this.shadowRoot.getElementById("reset");
        resetEl.addEventListener("click", () => {
            const event = new Event("value-reset", {bubbles: true, cancelable: true, composed: true});
            event.key = this.key;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    focus() {
        const firstFocusEl = this.shadowRoot.querySelector(Q_TAB);
        if (firstFocusEl != null) {
            firstFocusEl.focus();
        }
    }

    set key(value) {
        this.setAttribute("key", value);
    }

    get key() {
        return this.getAttribute("key");
    }

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set resettable(value) {
        this.setAttribute("resettable", value);
    }

    get resettable() {
        return this.getAttribute("resettable");
    }

    static get observedAttributes() {
        return ["value", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#errorText = this.revalidate();
                    /* --- */
                    const event = new Event("value-change", {bubbles: true, cancelable: true, composed: true});
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = this.value;
                    event.valid = this.isValid();
                    event.error = this.getError();
                    event.key = this.key;
                    event.fieldId = this.id;
                    this.dispatchEvent(event);
                }
            } break;
            case "tooltip": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("tooltip").i18nTooltip = newValue;
                }
            } break;
        }
    }

    // TODO revalidate with custom validation callback
    revalidate() {
        return "";
    }

    isValid() {
        return this.#errorText === "";
    }

    getError() {
        return this.isValid() ? null : this.#errorText;
    }

}
