import Button from "./Button.js";
import {
    registerFocusable
} from "../../../util/helper/html/getFocusableElements.js";
import CustomActionRegistry from "../../../data/registry/CustomActionRegistry.js";
import {
    deepClone
} from "../../../util/helper/DeepClone.js";
import CONFIG_FIELDS from "./ActionButton.js.json" assert {type: "json"};

export default class ActionButton extends Button {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #buttonEl;

    constructor() {
        super();
        /* --- */
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

}

customElements.define("emc-button-action", ActionButton);
registerFocusable("emc-button-action");
