import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../util/helper/html/ElementFocusHelper.js";
import ButtonVariants from "../../../enum/form/ButtonVariants.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nLabel.js";
import TPL from "./LinkButton.js.html" assert {type: "html"};
import STYLE from "./LinkButton.js.css" assert {type: "css"};
import VARIANT_STYLE from "./style/ButtonVariant.css" assert {type: "css"};
import CONFIG_FIELDS from "./LinkButton.js.json" assert {type: "json"};
import EventTargetManager from "../../../util/event/EventTargetManager.js";

export const BUTTON_VARIANTS = ButtonVariants;

export default class LinkButton extends CustomFormElementDelegating {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #tooltipEl;

    #textEl;

    #buttonEl;

    #buttonEventHandler = new EventTargetManager(null, false);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        VARIANT_STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEventHandler.switchTarget(this.#buttonEl);
        this.#buttonEventHandler.set("click", (event) => {
            this.clickHandler(event);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.#buttonEventHandler.active = true;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#buttonEventHandler.active = false;
    }

    clickHandler(event) {
        event.stopPropagation();
        const ev = new MouseEvent("click", event);
        this.dispatchEvent(ev);
        if (ev.defaultPrevented) {
            event.preventDefault();
            return false;
        }
        return true;
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

    set variant(value) {
        this.setEnumAttribute("variant", value, BUTTON_VARIANTS);
    }

    get variant() {
        return this.getEnumAttribute("variant");
    }

    set active(value) {
        this.setBooleanAttribute("active", value);
    }

    get active() {
        return this.getBooleanAttribute("active");
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
