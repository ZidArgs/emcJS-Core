import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import "../../../i18n/I18nInput.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import {
    toStartUppercaseEndLowercase
} from "../../../../util/helper/string/caseConversion.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import TPL from "./HotkeyInput.js.html" assert {type: "html"};
import STYLE from "./HotkeyInput.js.css" assert {type: "css"};

const BLACKLIST = [
    "Control",
    "Shift",
    "Alt",
    "Meta"
];
const VALUE_PARSE = /(ctrl\s*\+)?\s*(shift\s*\+)?\s*(alt\s*\+)?\s*(meta\s*\+)?\s*(.+)?/i;

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
            if (key !== "Tab") {
                if (key === "Escape") {
                    this.#value.ctrlKey = false;
                    this.#value.shiftKey = false;
                    this.#value.altKey = false;
                    this.#value.metaKey = false;
                    this.#value.key = null;
                    this.#display(this.#value);
                    this.#onInput();
                } else if (BLACKLIST.includes(key)) {
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
        this.#handleReadOnlyDisabled();
        this.#value = this.#parseKeys(this.getAttribute("value"));
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#handleReadOnlyDisabled();
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        super.value = this.#inputEl.value;
    }, 300);

    set value(value) {
        const parsedValue = this.#parseKeys(value);
        this.#value.ctrlKey = parsedValue.ctrlKey;
        this.#value.shiftKey = parsedValue.shiftKey;
        this.#value.altKey = parsedValue.altKey;
        this.#value.metaKey = parsedValue.metaKey;
        this.#value.key = parsedValue.key;
        this.#display(this.#value);
        super.value = this.#inputEl.value;
    }

    get value() {
        return this.#inputEl.value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#display(newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute("i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    this.#handleReadOnlyDisabled();
                }
            } break;
        }
    }

    setCustomValidity(message) {
        if (typeof message === "string" && message !== "") {
            this.internals.setValidity({customError: true}, message, this.#inputEl);
        } else {
            this.internals.setValidity({}, "");
        }
    }

    #display({ctrlKey, shiftKey, altKey, metaKey, key} = {}) {
        let res = "";
        if (ctrlKey) {
            res += "Ctrl + ";
        }
        if (shiftKey) {
            res += "Shift + ";
        }
        if (altKey) {
            res += "Alt + ";
        }
        if (metaKey) {
            res += "Meta + ";
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

FormElementRegistry.register("hotkey", HotkeyInput);
customElements.define("emc-input-hotkey", HotkeyInput);
