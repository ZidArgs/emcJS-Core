import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../util/helper/html/ElementFocusHelper.js";
import ButtonVariants from "../../../enum/form/ButtonVariants.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/builtin/I18nInput.js";
import TPL from "./Button.js.html" assert {type: "html"};
import STYLE from "./Button.js.css" assert {type: "css"};
import VARIANT_STYLE from "./style/ButtonVariant.css" assert {type: "css"};
import CONFIG_FIELDS from "./Button.js.json" assert {type: "json"};

export const BUTTON_VARIANTS = ButtonVariants;

const BORDER_POSITIONS = ["all", "left", "right", "top", "bottom"];

// TODO add "outline" variants
export default class Button extends CustomFormElementDelegating {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #tooltipEl;

    #buttonEl;

    #textEl;

    #buttonEventHandler = new EventTargetManager(null, false);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        VARIANT_STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#textEl = this.shadowRoot.getElementById("text");
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

    formDisabledCallback(disabled) {
        this.#buttonEl.disabled = disabled;
    }

    clickHandler(event) {
        event.stopPropagation();
        const ev = new MouseEvent("click", event);
        this.dispatchEvent(ev);
        return !ev.defaultPrevented;
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

    set slim(value) {
        this.setBooleanAttribute("slim", value);
    }

    get slim() {
        return this.getBooleanAttribute("slim");
    }

    set borderFlat(value) {
        this.setListAttribute("border-flat", value, BORDER_POSITIONS);
    }

    get borderFlat() {
        return this.getListAttribute("border-flat");
    }

    set borderOpen(value) {
        this.setListAttribute("border-open", value, BORDER_POSITIONS);
    }

    get borderOpen() {
        return this.getListAttribute("border-open");
    }

    static get observedAttributes() {
        return ["text", "icon", "tooltip"];
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
            case "tooltip": {
                if (oldValue != newValue) {
                    this.#tooltipEl.i18nTooltip = newValue;
                }
            } break;
        }
    }

    setCount(value, type) {
        value = parseInt(value);
        if (!isNaN(value) && value >= 0) {
            this.#buttonEl.setAttribute("count-value", value > 99 ? "99+" : value);
        } else {
            this.#buttonEl.removeAttribute("count-value");
        }
        if (typeof type === "string" && type !== "") {
            this.#buttonEl.setAttribute("count-type", type);
        } else {
            this.#buttonEl.removeAttribute("count-type");
        }
    }

}

customElements.define("emc-button", Button);
registerFocusable("emc-button");
