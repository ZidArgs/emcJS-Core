import CustomElementDelegating from "../../../../element/CustomElementDelegating.js";
import "../../../../i18n/builtin/I18nInput.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import "../../../../i18n/I18nTooltip.js";
import TPL from "./SearchField.js.html" assert {type: "html"};
import STYLE from "./SearchField.js.css" assert {type: "css"};

export default class SearchField extends CustomElementDelegating {

    #inputEl;

    #resetEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            this.#onInput();
        });
        this.#resetEl = this.shadowRoot.getElementById("reset");
        this.#resetEl.addEventListener("click", () => {
            this.value = "";
        });
    }

    #onInput = debounce(() => {
        this.value = this.#inputEl.value;
    }, 300);

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value") ?? "";
    }

    set disabled(value) {
        this.setBooleanAttribute("disabled", value);
        this.#inputEl.disabled = value;
        this.#resetEl.disabled = value;
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "value": {
                    this.#inputEl.value = newValue;
                    const event = new Event("change", {bubbles: true, cancelable: true});
                    event.value = newValue;
                    this.dispatchEvent(event);
                } break;
            }
        }
    }

}

customElements.define("emc-search-field", SearchField);
