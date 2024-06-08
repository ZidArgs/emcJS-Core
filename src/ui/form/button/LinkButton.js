import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../util/helper/html/getFocusableElements.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nLabel.js";
import TPL from "./LinkButton.js.html" assert {type: "html"};
import STYLE from "./LinkButton.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./LinkButton.js.json" assert {type: "json"};

export default class LinkButton extends CustomFormElementDelegating {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #tooltipEl;

    #textEl;

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", (event) => {
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    formDisabledCallback(disabled) {
        this.#buttonEl.setAttribute("disabled", disabled);
        if (disabled) {
            this.#buttonEl.setAttribute("tabindex", "-1");
        } else {
            this.#buttonEl.removeAttribute("tabindex");
        }
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

    set href(value) {
        this.setAttribute("href", value);
    }

    get href() {
        return this.getAttribute("href");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["text", "icon", "href", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "text": {
                if (oldValue != newValue) {
                    this.#textEl.i18nValue = newValue;
                }
            } break;
            case "icon": {
                if (oldValue != newValue) {
                    this.#buttonEl.setAttribute("icon", newValue);
                }
            } break;
            case "href": {
                if (oldValue != newValue) {
                    this.#buttonEl.href = newValue;
                }
            } break;
            case "tooltip": {
                if (oldValue != newValue) {
                    this.#tooltipEl.i18nTooltip = newValue;
                }
            } break;
        }
    }

}

customElements.define("emc-button-link", LinkButton);
registerFocusable("emc-button-link");
