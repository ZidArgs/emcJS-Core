import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import {
    deepClone
} from "../../../../../util/helper/DeepClone.js";
import {
    toStartUppercaseEndLowercase
} from "../../../../../util/helper/string/ConvertCase.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import "../../../../i18n/builtin/I18nInput.js";
import TPL from "./HotkeyInput.js.html" assert {type: "html"};
import STYLE from "./HotkeyInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./HotkeyInput.js.json" assert {type: "json"};

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

// TODO make view show buttons as "buttons" e.g. { [ctrl][alt][s] } instead of { ctrl alt s }
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

    #eventTargetManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#eventTargetManager = new EventTargetManager(this.#inputEl);
        this.#eventTargetManager.set("keydown", (event) => {
            const {key, ctrlKey, shiftKey, altKey, metaKey} = event;
            if (!BLACKLIST.includes(key)) {
                if (key === "Escape") {
                    this.#value.ctrlKey = false;
                    this.#value.shiftKey = false;
                    this.#value.altKey = false;
                    this.#value.metaKey = false;
                    this.#value.key = null;
                    this.renderValue(this.#stringifyValue(this.#value));
                    this.value = this.#inputEl.value;
                } else if (CONTROL_KEYS.includes(key)) {
                    this.renderValue(this.#stringifyValue({ctrlKey, shiftKey, altKey, metaKey, key: null}));
                    this.value = this.#inputEl.value;
                } else {
                    this.#value.ctrlKey = ctrlKey;
                    this.#value.shiftKey = shiftKey;
                    this.#value.altKey = altKey;
                    this.#value.metaKey = metaKey;
                    this.#value.key = key;
                    this.renderValue(this.#stringifyValue(this.#value));
                    this.value = this.#inputEl.value;
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#eventTargetManager.set("keyup", (event) => {
            if (event.key !== "Tab") {
                const value = this.#parseValue(this.#inputEl.value);
                if (value.key == null) {
                    const {ctrlKey, shiftKey, altKey, metaKey} = event;
                    this.renderValue(this.#stringifyValue({ctrlKey, shiftKey, altKey, metaKey, key: null}));
                    this.value = this.#inputEl.value;
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#inputEl.addEventListener("blur", () => {
            this.#inputEl.value = this.#stringifyValue(this.#value);
        });
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            this.value = "";
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
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
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

    #stringifyValue({ctrlKey, shiftKey, altKey, metaKey, key} = {}) {
        let res = "";
        if (ctrlKey) {
            res += "Ctrl ";
        }
        if (shiftKey) {
            res += "Shift ";
        }
        if (altKey) {
            res += "Alt ";
        }
        if (metaKey) {
            res += "Meta ";
        }
        if (key != null) {
            res += key === " " ? "Space" : toStartUppercaseEndLowercase(key);
        }
        return res;
    }

    #handleReadOnlyDisabled() {
        const readonly = this.getAttribute("readonly");
        const disabled = this.#inputEl.disabled;
        const ignoreInput = disabled || (readonly != null && readonly != "false");
        this.#eventTargetManager.setActive(!ignoreInput);
    }

    renderValue(value) {
        value = value ?? "";
        this.#inputEl.value = value;
        this.#value = this.#parseValue(value);
    }

}

FormElementRegistry.register("HotkeyInput", HotkeyInput);
customElements.define("emc-input-hotkey", HotkeyInput);
registerFocusable("emc-input-hotkey");
