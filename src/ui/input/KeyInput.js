import CustomElement from "../element/CustomElement.js";
import {
    toStartUppercaseEndLowercase
} from "../../util/helper/string/caseConversion.js";
import TPL from "./KeyInput.js.html" assert {type: "html"};
import STYLE from "./KeyInput.js.css" assert {type: "css"};

const BLACKLIST = [
    "Control",
    "Shift",
    "Alt"
];
const VALUE_PARSE = /(ctrl\+)?(shift\+)?(alt\+)?(.+)?/i;

export default class KeyInput extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("keydown", function(event) {
            const {
                ctrlKey,
                shiftKey,
                altKey,
                key
            } = event;
            if (BLACKLIST.includes(key)) {
                this.value = KeyInput.stringifyKeys({ctrlKey, shiftKey, altKey});
            } else {
                this.value = KeyInput.stringifyKeys({ctrlKey, shiftKey, altKey, key});
                const ev = new Event("change");
                ev.ctrlKey = ctrlKey;
                ev.shiftKey = shiftKey;
                ev.altKey = altKey;
                ev.key = key;
                this.dispatchEvent(ev);
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("keyup", function(event) {
            const value = KeyInput.parseKeys(this.value);
            if (value.key == null) {
                const {
                    ctrlKey,
                    shiftKey,
                    altKey
                } = event;
                this.value = KeyInput.stringifyKeys({ctrlKey, shiftKey, altKey});
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "value": {
                    const displayEl = this.shadowRoot.getElementById("display");
                    displayEl.value = newValue.split("+").map((s) => toStartUppercaseEndLowercase(s)).join(" + ")
                } break;
            }
        }
    }

    static parseKeys(string) {
        const res = VALUE_PARSE.exec(string);
        return {
            ctrlKey: res[1] != null,
            shiftKey: res[2] != null,
            altKey: res[3] != null,
            key: res[4]
        };
    }

    static stringifyKeys({ctrlKey, shiftKey, altKey, key} = {}) {
        let res = "";
        if (ctrlKey) {
            res += "ctrl+";
        }
        if (shiftKey) {
            res += "shift+";
        }
        if (altKey) {
            res += "alt+";
        }
        if (key != null) {
            res += key;
        }
        return res;
    }

}

customElements.define("emc-keyinput", KeyInput);
