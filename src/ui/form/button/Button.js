import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../util/helper/html/getFocusableElements.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/builtin/I18nInput.js";
import TPL from "./Button.js.html" assert {type: "html"};
import STYLE from "./Button.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./Button.js.json" assert {type: "json"};

export default class Button extends CustomFormElementDelegating {

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
        this.#buttonEl.addEventListener("click", (event) => this.clickHandler(event));
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

    set primary(value) {
        this.setBooleanAttribute("primary", value);
    }

    get primary() {
        return this.getBooleanAttribute("primary");
    }

    set secondary(value) {
        this.setBooleanAttribute("secondary", value);
    }

    get secondary() {
        return this.getBooleanAttribute("secondary");
    }

    set slim(value) {
        this.setBooleanAttribute("slim", value);
    }

    get slim() {
        return this.getBooleanAttribute("slim");
    }

    set borderFlat(value) {
        this.setListAttribute("border-flat", value, ["all", "left", "right", "top", "bottom"]);
    }

    get borderFlat() {
        return this.getListAttribute("border-flat");
    }

    set borderOpen(value) {
        this.setListAttribute("border-open", value, ["all", "left", "right", "top", "bottom"]);
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
