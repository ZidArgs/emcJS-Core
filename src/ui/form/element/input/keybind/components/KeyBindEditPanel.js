import CustomElement from "../../../../../element/CustomElement.js";
import EventTargetManager from "../../../../../../util/event/EventTargetManager.js";
import {toStartUppercaseEndLowercase} from "../../../../../../util/helper/string/ConvertCase.js";
import TPL from "./KeyBindEditPanel.js.html" assert {type: "html"};
import STYLE from "./KeyBindEditPanel.js.css" assert {type: "css"};

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

let activePanel = null;

// TODO add missing information and styling
// TODO supress tab
export default class KeyBindEditPanel extends CustomElement {

    #focusTopEl;

    #focusBottomEl;

    #modalEl;

    #inputEventTargetManager;

    #value = {
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        key: null
    };

    #keyDisplayEl;

    #ctrlKeyEl;

    #shiftKeyEl;

    #altKeyEl;

    #metaKeyEl;

    #customKeyEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
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
        this.#modalEl = this.shadowRoot.getElementById("modal");
        this.#keyDisplayEl = this.shadowRoot.getElementById("key-display");
        this.#inputEventTargetManager = new EventTargetManager(this.#modalEl);
        this.#inputEventTargetManager.set("keydown", (event) => {
            const {
                key, ctrlKey, shiftKey, altKey, metaKey
            } = event;
            if (!BLACKLIST.includes(key)) {
                if (key === "Escape") {
                    this.close();
                } else if (CONTROL_KEYS.includes(key)) {
                    this.renderValue({
                        ctrlKey,
                        shiftKey,
                        altKey,
                        metaKey,
                        key: null
                    });
                } else {
                    this.#value.ctrlKey = ctrlKey;
                    this.#value.shiftKey = shiftKey;
                    this.#value.altKey = altKey;
                    this.#value.metaKey = metaKey;
                    this.#value.key = key;
                    this.#internalSubmit();
                }
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.#inputEventTargetManager.set("keyup", (event) => {
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
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        /* --- */
        this.#focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        this.#focusTopEl.addEventListener("focus", () => {
            this.initialFocus();
        });
        this.#focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        this.#focusBottomEl.addEventListener("focus", () => {
            this.initialFocus();
        });
    }

    initialFocus() {
        this.#modalEl.focus();
    }

    remove() {
        super.remove();
        this.#value = {
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            key: null
        };
        this.#keyDisplayEl.innerHTML = "";
        activePanel = null;
    }

    show() {
        document.body.append(this);
        if (activePanel != null) {
            activePanel.close();
        }
        this.initialFocus();
        activePanel = this;
    }

    close() {
        this.remove();
        this.dispatchEvent(new Event("close"));
    }

    #internalSubmit() {
        const value = {...this.#value};
        this.remove();
        const ev = new Event("submit");
        ev.value = value;
        this.dispatchEvent(ev);
    }

    renderValue(value) {
        value = value ?? {
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            key: null
        };

        this.#keyDisplayEl.innerHTML = "";
        const {
            ctrlKey, shiftKey, altKey, metaKey, key
        } = value;
        if (ctrlKey) {
            this.#keyDisplayEl.append(this.#ctrlKeyEl);
        }
        if (shiftKey) {
            this.#keyDisplayEl.append(this.#shiftKeyEl);
        }
        if (altKey) {
            this.#keyDisplayEl.append(this.#altKeyEl);
        }
        if (metaKey) {
            this.#keyDisplayEl.append(this.#metaKeyEl);
        }
        if (key != null) {
            const keyText = key === " " ? "Space" : toStartUppercaseEndLowercase(key);
            this.#customKeyEl.i18nValue = keyText;
            this.#keyDisplayEl.append(this.#customKeyEl);
        }
    }

}

customElements.define("emc-input-keybind-edit-panel", KeyBindEditPanel);
