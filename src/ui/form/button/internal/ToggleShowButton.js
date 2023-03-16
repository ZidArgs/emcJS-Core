import CustomElementDelegating from "../../../element/CustomElementDelegating.js";
import "../../../i18n/I18nTooltip.js";
import TPL from "./ToggleShowButton.js.html" assert {type: "html"};
import STYLE from "./ToggleShowButton.js.css" assert {type: "css"};

export default class ToggleShowButton extends CustomElementDelegating {

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
        const tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#buttonEl.addEventListener("change", (event) => {
            this.dispatchEvent(new Event("change", event));
            tooltipEl.i18nTooltip = this.#buttonEl.checked ? "Input shown" : "Input hidden";
        });
        this.#buttonEl.addEventListener("click", (event) => {
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    formDisabledCallback(disabled) {
        this.#buttonEl.disabled = disabled;
    }

    set checked(value) {
        this.#buttonEl.checked = value;
    }

    get checked() {
        return this.#buttonEl.checked;
    }

}

customElements.define("emc-toggle-show-button", ToggleShowButton);
