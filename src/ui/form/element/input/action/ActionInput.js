import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/I18nLabel.js";
import "../../../../i18n/I18nTooltip.js";
import TPL from "./ActionInput.js.html" assert {type: "html"};
import STYLE from "./ActionInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ActionInput.js.json" assert {type: "json"};

export default class ActionInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    static get changeDebounceTime() {
        return 0;
    }

    #inputEl;

    #buttonEl;

    #valueRenderer = null;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.registerTargetEventHandler(this.#inputEl, "focus", () => {
            this.#buttonEl.focus();
        });
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.registerTargetEventHandler(this.#buttonEl, "click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const ev = new Event("action");
            ev.value = this.value;
            this.dispatchEvent(ev);
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
    }

    validityCallback(message) {
        this.#inputEl.setCustomValidity(message);
    }

    focus(options) {
        super.focus(options);
        this.#buttonEl.focus(options);
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#buttonEl, "readonly", this.readonly);
                }
            } break;
        }
    }

    renderValue(value) {
        if (this.#valueRenderer != null) {
            this.#inputEl.value = this.#valueRenderer(value);
        } else {
            this.#inputEl.value = value;
        }
    }

    setValueRenderer(renderer) {
        if (typeof renderer === "function") {
            this.#valueRenderer = renderer;
            this.#inputEl.value = this.#valueRenderer(this.value);
        } else {
            this.#valueRenderer = null;
            this.#inputEl.value = this.value;
        }
    }

}

FormElementRegistry.register("ActionInput", ActionInput);
customElements.define("emc-input-action", ActionInput);
registerFocusable("emc-input-action");
