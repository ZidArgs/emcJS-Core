import Button from "./Button.js";
import {
    registerFocusable
} from "../../../util/helper/html/getFocusableElements.js";
import STYLE from "./SubmitButton.js.css" assert {type: "css"};

export default class SubmitButton extends Button {

    #textEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#textEl.i18nValue = "Submit";
    }

    clickHandler(event) {
        if (super.clickHandler(event)) {
            if (this.form != null) {
                this.form.requestSubmit();
            }
            return true;
        }
        return false;
    }

}

customElements.define("emc-button-submit", SubmitButton);
registerFocusable("emc-button-submit");
