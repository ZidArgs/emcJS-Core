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

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    focus(options) {
        if (this.#buttonEl != null) {
            this.#buttonEl.focus(options);
        }
    }

    set checked(value) {
        this.#buttonEl.checked = value;
    }

    get checked() {
        return this.#buttonEl.checked;
    }

    set disabled(value) {
        this.#buttonEl.disabled = value;
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

}

customElements.define("emc-toggle-show-button", ToggleShowButton);
