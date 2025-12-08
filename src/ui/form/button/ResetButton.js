import Button from "./Button.js";
import {registerFocusable} from "../../../util/helper/html/ElementFocusHelper.js";
import STYLE from "./ResetButton.js.css" assert {type: "css"};
import {isStringNotEmpty} from "../../../util/helper/CheckType.js";

export default class ResetButton extends Button {

    #buttonEl;

    #textEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.setAttribute("type", "reset");
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

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "text" && !isStringNotEmpty(newValue)) {
            newValue = "Reset";
        }
        super.attributeChangedCallback(name, oldValue, newValue);
    }

}

customElements.define("emc-button-reset", ResetButton);
registerFocusable("emc-button-reset");
