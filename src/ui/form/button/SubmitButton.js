import AbstractFormElement from "../AbstractFormElement.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nInput.js";
import TPL from "./SubmitButton.js.html" assert {type: "html"};
import STYLE from "./SubmitButton.js.css" assert {type: "css"};

export default class SubmitButton extends AbstractFormElement {

    #buttonEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            if (this.form != null) {
                this.form.requestSubmit();
            } else {
                const formEl = this.closest("emc-form");
                if (formEl != null) {
                    formEl.submit();
                }
            }
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
    }

    focus() {
        if (this.#buttonEl != null) {
            this.#buttonEl.focus();
        }
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    static get observedAttributes() {
        return ["tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "tooltip": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("tooltip").i18nTooltip = newValue;
                }
            } break;
        }
    }

}

customElements.define("emc-button-submit", SubmitButton);
