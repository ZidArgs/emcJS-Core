import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/builtin/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    toStartUppercaseEndLowercase
} from "../../../../util/helper/string/ConvertCase.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import {
    safeSetAttribute
} from "../../../../util/helper/ui/NodeAttributes.js";
import TPL from "./HotkeyInput.js.html" assert {type: "html"};
import STYLE from "./HotkeyInput.js.css" assert {type: "css"};

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

export default class HotkeyInput extends AbstractFormInput {

    #value = {
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        key: null
    };

    #inputEl;

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
                    this.#display(this.#value);
                    this.#onInput();
                } else if (CONTROL_KEYS.includes(key)) {
                    this.#display({ctrlKey, shiftKey, altKey, metaKey, key: null});
                } else {
                    this.#value.ctrlKey = ctrlKey;
                    this.#value.shiftKey = shiftKey;
                    this.#value.altKey = altKey;
                    this.#value.metaKey = metaKey;
                    this.#value.key = key;
                    this.#display(this.#value);
                    this.#onInput();
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#eventTargetManager.set("keyup", (event) => {
            if (event.key !== "Tab") {
                const value = this.#parseKeys(this.#inputEl.value);
                if (value.key == null) {
                    const {ctrlKey, shiftKey, altKey, metaKey} = event;
                    this.#display({ctrlKey, shiftKey, altKey, metaKey, key: null});
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#inputEl.addEventListener("blur", () => {
            this.#display(this.#value);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.#parseKeys(this.value);
        this.#handleReadOnlyDisabled();
        this.#display(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#handleReadOnlyDisabled();
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#display(value);
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        const parsedValue = this.#parseKeys(value ?? this.defaultValue);
        this.#display(parsedValue);
        this.#value.ctrlKey = parsedValue.ctrlKey;
        this.#value.shiftKey = parsedValue.shiftKey;
        this.#value.altKey = parsedValue.altKey;
        this.#value.metaKey = parsedValue.metaKey;
        this.#value.key = parsedValue.key;
        super.value = value != null ? this.#inputEl.value.toLowerCase() : null;
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "value", newValue);
                    if (!this.isChanged) {
                        const value = this.#parseKeys(this.value);
                        this.#handleReadOnlyDisabled();
                        this.#display(value);
                    }
                }
            } break;
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

    #display({ctrlKey, shiftKey, altKey, metaKey, key} = {}) {
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
        this.#inputEl.value = res;
    }

    #parseKeys(string) {
        const res = VALUE_PARSE.exec(string);
        return {
            ctrlKey: res[1] != null,
            shiftKey: res[2] != null,
            altKey: res[3] != null,
            metaKey: res[4] != null,
            key: res[5]?.toLowerCase() === "space" ? " " : res[5] ?? null
        };
    }

    #handleReadOnlyDisabled() {
        const readonly = this.getAttribute("readonly");
        const disabled = this.#inputEl.disabled;
        const ignoreInput = disabled || (readonly != null && readonly != "false");
        this.#eventTargetManager.setActive(!ignoreInput);
    }

}

FormElementRegistry.register("HotkeyInput", HotkeyInput);
customElements.define("emc-field-input-hotkey", HotkeyInput);
