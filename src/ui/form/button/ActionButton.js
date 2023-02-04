import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import CustomActionRegistry from "../../../data/registry/CustomActionRegistry.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nInput.js";
import TPL from "./ActionButton.js.html" assert {type: "html"};
import STYLE from "./ActionButton.js.css" assert {type: "css"};

export default class ActionButton extends CustomFormElementDelegating {

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", (event) => {
            const customAction = CustomActionRegistry.get(this.action);
            if (customAction != null) {
                customAction(this);
            }
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    formDisabledCallback(disabled) {
        this.#buttonEl.disabled = disabled;
    }

    get type() {
        return "button";
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set action(value) {
        this.setAttribute("action", value);
    }

    get action() {
        return this.getAttribute("action");
    }

    set text(value) {
        this.setAttribute("text", value);
    }

    get text() {
        return this.getAttribute("text");
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
        return ["text", "icon", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "text": {
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
