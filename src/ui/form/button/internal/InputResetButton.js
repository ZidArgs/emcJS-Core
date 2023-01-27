import CustomElementDelegating from "../../../element/CustomElementDelegating.js";
import "../../../i18n/I18nTooltip.js";
import TPL from "./InputResetButton.js.html" assert {type: "html"};
import STYLE from "./InputResetButton.js.css" assert {type: "css"};

export default class InputResetButton extends CustomElementDelegating {

    static get formAssociated() {
        return true;
    }

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", (event) => {
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    set disabled(value) {
        this.#buttonEl.disabled = value;
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

}

customElements.define("emc-input-reset-button", InputResetButton);
