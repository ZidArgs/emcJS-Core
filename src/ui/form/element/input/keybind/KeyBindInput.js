import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {toStartUppercaseEndLowercase} from "../../../../../util/helper/string/ConvertCase.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import {I18nValueObserver} from "../../../../../util/observer/i18n/I18nValueObserver.js";
import KeySequence from "../../../../../util/keyboard/KeySequence.js";
import KeyBindEditPanel from "./components/KeyBindEditPanel.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./KeyBindInput.js.html" assert {type: "html"};
import STYLE from "./KeyBindInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./KeyBindInput.js.json" assert {type: "json"};

export default class KeyBindInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #value = {
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        key: null
    };

    #inputEl;

    #buttonEl;

    #inputElementEventTargetManager;

    #languageEventTargetManager = new EventTargetManager();

    #ctrlKeyEl;

    #shiftKeyEl;

    #altKeyEl;

    #metaKeyEl;

    #customKeyEl;

    #keyBindEditPanel = new KeyBindEditPanel();

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#ctrlKeyEl = document.createElement("emc-keycap");
        this.#ctrlKeyEl.innerText = "Ctrl";
        this.#shiftKeyEl = document.createElement("emc-keycap");
        this.#shiftKeyEl.innerText = "Shift";
        this.#altKeyEl = document.createElement("emc-keycap");
        this.#altKeyEl.innerText = "Alt";
        this.#metaKeyEl = document.createElement("emc-keycap");
        this.#metaKeyEl.innerText = "Meta";
        this.#customKeyEl = document.createElement("emc-keycap");
        this.#customKeyEl.innerText = "";
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputElementEventTargetManager = new EventTargetManager(this.#inputEl);
        this.#inputElementEventTargetManager.set("click", () => {
            this.#keyBindEditPanel.show();
        });
        this.#inputElementEventTargetManager.set("keydown", (event) => {
            const {
                key, shiftKey
            } = event;
            if ((key === "Enter" && !shiftKey) || key === " ") {
                this.#keyBindEditPanel.show();
                event.preventDefault();
                event.stopPropagation();
                return false;
            } else if (key === "Escape") {
                this.#value.ctrlKey = false;
                this.#value.shiftKey = false;
                this.#value.altKey = false;
                this.#value.metaKey = false;
                this.#value.key = null;
                this.renderValue(this.#value);
                this.value = KeySequence.stringify(this.#value);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#inputElementEventTargetManager.set("blur", () => {
            if (this.#value?.key == null) {
                this.#value = {
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    key: null
                };
                this.renderValue(this.#value);
                this.value = KeySequence.stringify(this.#value);
            }
        });
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            this.value = "";
        });
        this.#keyBindEditPanel.addEventListener("submit", (event) => {
            const {
                ctrlKey, shiftKey, altKey, metaKey, key
            } = event.value;
            this.#value.ctrlKey = ctrlKey;
            this.#value.shiftKey = shiftKey;
            this.#value.altKey = altKey;
            this.#value.metaKey = metaKey;
            this.#value.key = key;
            this.renderValue(this.#value);
            this.value = KeySequence.stringify(this.#value);
            this.#inputEl.focus();
        });
        /* --- */
        this.#languageEventTargetManager.set("change", (event) => {
            safeSetAttribute(this.#inputEl, "placeholder", event.value);
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.disabled = disabled;
        this.#handleReadOnlyDisabled();
    }

    focus(options) {
        super.focus(options);
        this.#inputEl.focus(options);
    }

    set rawValue(value) {
        this.#value.ctrlKey = value.ctrlKey;
        this.#value.shiftKey = value.shiftKey;
        this.#value.altKey = value.altKey;
        this.#value.metaKey = value.metaKey;
        this.#value.key = value.key;
        this.value = KeySequence.stringify(this.#value);
    }

    get rawValue() {
        return {...this.#value};
    }

    getSubmitValue() {
        const value = this.value;
        if (value == null) {
            return "";
        }
        return value;
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "readonly", "placeholder"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "placeholder": {
                if (oldValue != newValue) {
                    const i18nValueObserver = new I18nValueObserver(newValue);
                    this.#languageEventTargetManager.switchTarget(i18nValueObserver);
                    safeSetAttribute(this.#inputEl, "placeholder", i18nValueObserver.value);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    this.#handleReadOnlyDisabled();
                }
            } break;
            case "label": {
                if (oldValue != newValue) {
                    this.#keyBindEditPanel.caption = newValue;
                }
            } break;
        }
    }

    #handleReadOnlyDisabled() {
        const readonly = this.getAttribute("readonly");
        const disabled = this.#inputEl.disabled;
        const ignoreInput = disabled || (readonly != null && readonly != "false");
        this.#inputElementEventTargetManager.active = !ignoreInput;
    }

    renderValue(value) {
        value = value ?? {
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            key: null
        };
        if (typeof value === "string") {
            value = KeySequence.parse(value);
        }
        this.#value = value;

        this.#inputEl.innerHTML = "";
        const {
            ctrlKey, shiftKey, altKey, metaKey, key
        } = value;
        if (ctrlKey) {
            this.#inputEl.append(this.#ctrlKeyEl);
        }
        if (shiftKey) {
            this.#inputEl.append(this.#shiftKeyEl);
        }
        if (altKey) {
            this.#inputEl.append(this.#altKeyEl);
        }
        if (metaKey) {
            this.#inputEl.append(this.#metaKeyEl);
        }
        if (key != null) {
            const keyText = key === " " ? "Space" : toStartUppercaseEndLowercase(key);
            this.#customKeyEl.innerText = keyText;
            this.#inputEl.append(this.#customKeyEl);
        }
    }

    checkValid() {
        const value = this.#value;
        if (value != null) {
            const {
                ctrlKey, shiftKey, altKey, metaKey, key
            } = value;
            if ((ctrlKey || shiftKey || altKey || metaKey) && key == null) {
                return "The input is missing a destinctive key";
            }
        }
        return super.checkValid();
    }

}

FormElementRegistry.register("KeyBindInput", KeyBindInput);
customElements.define("emc-input-keybind", KeyBindInput);
registerFocusable("emc-input-keybind");
