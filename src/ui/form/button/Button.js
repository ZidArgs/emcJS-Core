import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../util/helper/html/ElementFocusHelper.js";
import ButtonVariants from "../../../enum/form/ButtonVariants.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nLabel.js";
import "../../icon/FAIcon.js";
import "../../icon/FontIcon.js";
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

    #faIconEl;

    #fontIconEl;

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
        this.#faIconEl = this.shadowRoot.getElementById("fa-icon");
        this.#fontIconEl = this.shadowRoot.getElementById("font-icon");
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
        this.setStringAttribute("name", value);
    }

    get name() {
        return this.getStringAttribute("name");
    }

    set text(value) {
        this.setStringAttribute("text", value);
    }

    get text() {
        return this.getStringAttribute("text");
    }

    set icon(value) {
        this.setStringAttribute("icon", value);
    }

    get icon() {
        return this.getStringAttribute("icon");
    }

    set iconType(value) {
        this.setStringAttribute("icon-type", value);
    }

    get iconType() {
        return this.getStringAttribute("icon-type");
    }

    set tooltip(value) {
        this.setStringAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getStringAttribute("tooltip");
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
        return ["text", "icon", "icon-type", "tooltip"];
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
                    this.#applyIcon(this.iconType, newValue);
                }
            } break;
            case "icon-type": {
                if (oldValue != newValue) {
                    this.#applyIcon(newValue, this.icon);
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

    #applyIcon(type, value) {
        this.#fontIconEl.removeAttribute("icon");
        this.#faIconEl.removeAttribute("icon");
        this.#faIconEl.removeAttribute("type");
        this.#buttonEl.removeAttribute("icon");
        this.#buttonEl.style.removeProperty("--icon-image");

        switch (type) {
            case "font": {
                this.#buttonEl.setAttribute("icon-type", "font");
                this.#fontIconEl.setAttribute("icon", value);
            } break;
            case "fa": {
                const [name, type = "classic"] = value.split("/");
                this.#buttonEl.setAttribute("icon-type", "fa");
                this.#faIconEl.setAttribute("icon", name);
                this.#faIconEl.setAttribute("type", type);
            } break;
            case "image": {
                this.#buttonEl.setAttribute("icon-type", "image");
                this.#buttonEl.style.setProperty("--icon-image", value);
            } break;
            default: {
                this.#buttonEl.setAttribute("icon-type", "char");
                this.#buttonEl.setAttribute("icon", value);
            } break;
        }
    }

}

customElements.define("emc-button", Button);
registerFocusable("emc-button");
