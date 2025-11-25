import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {toStartUppercaseEndLowercase} from "../../../../../util/helper/string/ConvertCase.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./HotkeyInput.js.html" assert {type: "html"};
import STYLE from "./HotkeyInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./HotkeyInput.js.json" assert {type: "json"};
import {I18nValueObserver} from "../../../../../util/observer/i18n/I18nValueObserver.js";

const BLACKLIST = [
    "Tab",
    "AltGraph",
    "CapsLock",
    "NumLock",
    "Fn",
    "FnLock",
    "Hyper",
    "ScrollLock",
    "Super",
    "Symbol",
    "SymbolLock"
];

const CONTROL_KEYS = [
    "Control",
    "Shift",
    "Alt",
    "Meta"
];
const VALUE_PARSE = /(ctrl\s+)?(shift\s+)?(alt\s+)?(meta\s+)?(.+)?/i;

// FIXME when shift+tabbing out of element, the shift stays (no blur?)
export default class HotkeyInput extends AbstractFormElement {

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

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#ctrlKeyEl = document.createElement("emc-i18n-label");
        this.#ctrlKeyEl.className = "key";
        this.#ctrlKeyEl.i18nValue = "Ctrl";
        this.#shiftKeyEl = document.createElement("emc-i18n-label");
        this.#shiftKeyEl.className = "key";
        this.#shiftKeyEl.i18nValue = "Shift";
        this.#altKeyEl = document.createElement("emc-i18n-label");
        this.#altKeyEl.className = "key";
        this.#altKeyEl.i18nValue = "Alt";
        this.#metaKeyEl = document.createElement("emc-i18n-label");
        this.#metaKeyEl.className = "key";
        this.#metaKeyEl.i18nValue = "Meta";
        this.#customKeyEl = document.createElement("emc-i18n-label");
        this.#customKeyEl.className = "key";
        this.#customKeyEl.i18nValue = "";
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputElementEventTargetManager = new EventTargetManager(this.#inputEl);
        this.#inputElementEventTargetManager.set("keydown", (event) => {
            const {
                key, ctrlKey, shiftKey, altKey, metaKey
            } = event;
            if (!BLACKLIST.includes(key)) {
                if (key === "Escape") {
                    this.#value.ctrlKey = false;
                    this.#value.shiftKey = false;
                    this.#value.altKey = false;
                    this.#value.metaKey = false;
                    this.#value.key = null;
                    this.renderValue(this.#value);
                    this.value = this.#stringifyValue(this.#value);
                } else if (CONTROL_KEYS.includes(key)) {
                    this.renderValue({
                        ctrlKey,
                        shiftKey,
                        altKey,
                        metaKey,
                        key: null
                    });
                    this.value = this.#stringifyValue(this.#value);
                } else {
                    this.#value.ctrlKey = ctrlKey;
                    this.#value.shiftKey = shiftKey;
                    this.#value.altKey = altKey;
                    this.#value.metaKey = metaKey;
                    this.#value.key = key;
                    this.renderValue(this.#value);
                    this.value = this.#stringifyValue(this.#value);
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#inputElementEventTargetManager.set("keyup", (event) => {
            if (event.key !== "Tab") {
                if (this.#value.key == null) {
                    const {
                        ctrlKey, shiftKey, altKey, metaKey
                    } = event;
                    this.renderValue({
                        ctrlKey,
                        shiftKey,
                        altKey,
                        metaKey,
                        key: null
                    });
                    this.value = this.#stringifyValue(this.#value);
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#inputEl.addEventListener("blur", () => {
            this.renderValue(this.#value);
        });
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            this.value = "";
        });
        /* --- */
        this.#languageEventTargetManager.set("change", (event) => {
            safeSetAttribute(this.#inputEl, "placeholder", event.value);
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
        this.#handleReadOnlyDisabled();
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set rawValue(value) {
        this.#value.ctrlKey = value.ctrlKey;
        this.#value.shiftKey = value.shiftKey;
        this.#value.altKey = value.altKey;
        this.#value.metaKey = value.metaKey;
        this.#value.key = value.key;
        this.value = this.#stringifyValue(this.#value);
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
        }
    }

    #parseValue(string) {
        const res = VALUE_PARSE.exec(string ?? "");
        return {
            ctrlKey: res[1] != null,
            shiftKey: res[2] != null,
            altKey: res[3] != null,
            metaKey: res[4] != null,
            key: res[5]?.toLowerCase() === "space" ? " " : res[5] ?? null
        };
    }

    #stringifyValue(opts = {}) {
        const {
            ctrlKey, shiftKey, altKey, metaKey, key
        } = opts;
        let res = "";
        if (ctrlKey) {
            res += "ctrl ";
        }
        if (shiftKey) {
            res += "shift ";
        }
        if (altKey) {
            res += "alt ";
        }
        if (metaKey) {
            res += "meta ";
        }
        if (key != null) {
            res += key === " " ? "space" : key.toLowerCase();
        }
        return res;
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
            value = this.#parseValue(value);
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
            const keyText = key === " " ? "space" : toStartUppercaseEndLowercase(key);
            this.#customKeyEl.i18nValue = keyText;
            this.#inputEl.append(this.#customKeyEl);
        }
    }

}

FormElementRegistry.register("HotkeyInput", HotkeyInput);
customElements.define("emc-input-hotkey", HotkeyInput);
registerFocusable("emc-input-hotkey");
