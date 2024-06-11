import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../data/registry/form/FormElementRegistry.js";
import "../../../i18n/I18nLabel.js";
import "../../../i18n/I18nTooltip.js";
import TPL from "./ActionInput.js.html" assert {type: "html"};
import STYLE from "./ActionInput.js.css" assert {type: "css"};

export default class ActionInput extends AbstractFormElement {

    #textEl;

    #buttonEl;

    #valueRenderer = null;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            const event = new Event("action");
            event.value = this.value;
            this.dispatchEvent(event);
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    renderValue(value) {
        if (this.#valueRenderer != null) {
            this.#valueRenderer(value);
        } else {
            this.#textEl.i18nValue = value;
        }
    }

    setValueRenderer(renderer) {
        if (typeof renderer === "function") {
            this.#valueRenderer = renderer;
        } else {
            this.#valueRenderer = null;
        }
    }

}

FormElementRegistry.register("ActionInput", ActionInput);
customElements.define("emc-input-action", ActionInput);
