import Button from "./Button.js";
import {
    registerFocusable
} from "../../../util/helper/html/getFocusableElements.js";
import CustomActionRegistry from "../../../data/registry/CustomActionRegistry.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import STYLE from "./ErrorButton.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ErrorButton.js.json" assert {type: "json"};

export default class ErrorButton extends Button {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #textEl;

    #buttonEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", (event) => {
            const customAction = CustomActionRegistry.current.get(this.action);
            if (customAction != null) {
                customAction(this);
            }
            this.dispatchEvent(new MouseEvent("click", event));
            event.stopPropagation();
        });
    }

    set action(value) {
        this.setAttribute("action", value);
    }

    get action() {
        return this.getAttribute("action");
    }

    setErrors(errors) {
        // TODO render errors
        const errorCount = errors?.length ?? 0;
        if (errorCount > 0) {
            this.#textEl.setAttribute("error-count", errorCount > 99 ? "99+" : errorCount);
        } else {
            this.#textEl.removeAttribute("error-count");
        }
    }

}

customElements.define("emc-button-error", ErrorButton);
registerFocusable("emc-button-error");
