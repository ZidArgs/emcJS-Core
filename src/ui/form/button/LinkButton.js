import {deepClone} from "../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../util/helper/html/ElementFocusHelper.js";
import "../../i18n/I18nTooltip.js";
import "../../i18n/I18nLabel.js";
import TPL from "./LinkButton.js.html" assert {type: "html"};
import STYLE from "./LinkButton.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./LinkButton.js.json" assert {type: "json"};
import Button from "./Button.js";

export default class LinkButton extends Button {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #buttonEl;

    constructor() {
        super();
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.append(els);
    }

    clickHandler(event) {
        const resume = super.clickHandler(event);
        if (resume) {
            window.open(this.href, "_blank");
        }
    }

    set href(value) {
        this.setAttribute("href", value);
    }

    get href() {
        return this.getAttribute("href");
    }

}

customElements.define("emc-button-link", LinkButton);
registerFocusable("emc-button-link");
