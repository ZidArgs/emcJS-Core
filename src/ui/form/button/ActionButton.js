import CustomFormElement from "../../element/CustomFormElement.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nInput.js";
import TPL from "./ActionButton.js.html" assert {type: "html"};
import STYLE from "./ActionButton.js.css" assert {type: "css"};

export default class ActionButton extends CustomFormElement {

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", (event) => {
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    focus(options) {
        if (this.#buttonEl != null) {
            this.#buttonEl.focus(options);
        }
    }

    formDisabledCallback(disabled) {
        this.#buttonEl.disabled = disabled;
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    set icon(value) {
        this.setAttribute("icon", value);
    }

    get icon() {
        return this.getAttribute("icon");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["value", "icon", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("text").i18nValue = newValue;
                }
            } break;
            case "icon": {
                if (oldValue != newValue) {
                    this.#buttonEl.setAttribute("icon", newValue);
                }
            } break;
            case "tooltip": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("tooltip").i18nTooltip = newValue;
                }
            } break;
        }
    }

}

customElements.define("emc-button-action", ActionButton);
