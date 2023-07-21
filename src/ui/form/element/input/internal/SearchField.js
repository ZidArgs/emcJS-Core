import CustomElementDelegating from "../../../../element/CustomElementDelegating.js";
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
        const value = this.#inputEl.value;
        this.value = value;
    }, 300);

    set value(value) {
        this.#inputEl.value = value;
        const event = new Event("change", {bubbles: true, cancelable: true});
        this.dispatchEvent(event);
    }

    get value() {
        return this.#inputEl.value;
    }

    set disabled(value) {
        this.setBooleanAttribute("disabled", value);
        this.#inputEl.disabled = value;
        this.#resetEl.disabled = value;
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

}

customElements.define("emc-search-field", SearchField);
