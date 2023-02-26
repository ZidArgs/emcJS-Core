import Button from "./Button.js";
import STYLE from "./ResetButton.js.css" assert {type: "css"};

export default class ResetButton extends Button {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const textEl = this.shadowRoot.getElementById("text");
        textEl.i18nValue = "Reset";
        const buttonEl = this.shadowRoot.getElementById("button");
        buttonEl.addEventListener("click", () => {
            if (this.form != null) {
                this.form.reset();
            }
        });
    }

}

customElements.define("emc-button-reset", ResetButton);
