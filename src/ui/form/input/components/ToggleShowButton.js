import CustomElementDelegating from "../../../element/CustomElementDelegating.js";
import "../../../i18n/I18nTooltip.js";
import TPL from "./ToggleShowButton.js.html" assert {type: "html"};
import STYLE from "./ToggleShowButton.js.css" assert {type: "css"};

export default class ToggleShowButton extends CustomElementDelegating {

    #inputEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        const tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#inputEl.addEventListener("change", (event) => {
            this.dispatchEvent(new Event("change", event));
            tooltipEl.i18nTooltip = this.#inputEl.checked ? "Input Shown" : "Input Hidden";
        });
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

    focus() {
        if (this.#inputEl != null) {
            this.#inputEl.focus();
        }
    }

    get checked() {
        return this.#inputEl.checked;
    }

    set checked(value) {
        this.#inputEl.checked = value;
    }

}

customElements.define("emc-toggle-show-button", ToggleShowButton);
