import FormField from "../FormField.js";
import "../InputResetButton.js";
import TPL from "./StringInput.js.html" assert {type: "html"};
import STYLE from "./StringInput.js.css" assert {type: "css"};

export default class StringInput extends FormField {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.value;
        });
        const resetEl = this.shadowRoot.getElementById("reset");
        resetEl.addEventListener("click", () => {
            const event = new Event("reset");
            event.key = this.key;
            this.dispatchEvent(event);
        });
    }

    set resettable(value) {
        this.setAttribute("resettable", value);
    }

    get resettable() {
        return this.getAttribute("resettable");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value":
                if (oldValue != newValue) {
                    this.#inputEl.value = newValue;
                }
                break;
        }
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    revalidate() {
        return this.#inputEl.value !== "";
    }

}

customElements.define("emc-input-string", StringInput);
