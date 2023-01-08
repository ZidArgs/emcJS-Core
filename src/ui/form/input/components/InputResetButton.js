import CustomElementDelegating from "../../../element/CustomElementDelegating.js";
import "../../../i18n/I18nTooltip.js";
import TPL from "./InputResetButton.js.html" assert {type: "html"};
import STYLE from "./InputResetButton.js.css" assert {type: "css"};

export default class InputResetButton extends CustomElementDelegating {

    static get formAssociated() {
        return true;
    }

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("click", (event) => {
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    focus(options) {
        if (this.#inputEl != null) {
            this.#inputEl.focus(options);
        }
    }

    set disabled(value) {
        this.#inputEl.disabled = value;
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

}

customElements.define("emc-input-reset-button", InputResetButton);
