import Button from "./Button.js";
import STYLE from "./SubmitButton.js.css" assert {type: "css"};

export default class SubmitButton extends Button {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const textEl = this.shadowRoot.getElementById("text");
        textEl.i18nValue = "Submit";
        const buttonEl = this.shadowRoot.getElementById("button");
        buttonEl.addEventListener("click", () => {
            if (this.form != null) {
                this.form.requestSubmit();
            }
        });
    }

}

customElements.define("emc-button-submit", SubmitButton);
