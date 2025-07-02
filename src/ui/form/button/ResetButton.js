import Button from "./Button.js";
import {registerFocusable} from "../../../util/helper/html/ElementFocusHelper.js";
import STYLE from "./ResetButton.js.css" assert {type: "css"};

export default class ResetButton extends Button {

    #textEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#textEl.i18nValue = "Reset";
    }

    clickHandler(event) {
        if (super.clickHandler(event)) {
            if (this.form != null) {
                this.form.reset();
            }
            return true;
        }
        return false;
    }

}

customElements.define("emc-button-reset", ResetButton);
registerFocusable("emc-button-reset");
