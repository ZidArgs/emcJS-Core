import AbstractFormElement from "../AbstractFormElement.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "./AbstractFormInput.js.html" assert {type: "html"};
import STYLE from "./AbstractFormInput.js.css" assert {type: "css"};

// https://web.dev/more-capable-form-controls/#form-associated-custom-elements

/*
TODO prevent default invalid handling
document.addEventListener('invalid', (function(){
    return function(e) {
      //prevent the browser from showing default error bubble / hint
      e.preventDefault();
      // optionally fire off some custom validation handler
      // myValidation();
    };
})(), true);
*/

export default class AbstractFormInput extends AbstractFormElement {

    #errorText = "";

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const resetEl = this.shadowRoot.getElementById("reset");
        resetEl.addEventListener("click", () => {
            const event = new Event("value-reset", {bubbles: true, cancelable: true});
            event.key = this.key;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        });
    }

    set value(value) {
        this.internals.setFormValue(value);
        /* --- */
        // TODO check validity
        const event = new Event("value-change", {bubbles: true, cancelable: true});
        event.value = value;
        event.valid = this.isValid();
        event.error = this.getError();
        event.name = this.name;
        event.fieldId = this.id;
        this.dispatchEvent(event);
    }

    get value() {
        return super.value;
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set resettable(value) {
        this.setAttribute("resettable", value);
    }

    get resettable() {
        return this.getAttribute("resettable");
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

    // TODO revalidate with custom validation callback
    revalidate() {
        return "";
    }

    isValid() {
        return this.#errorText === "";
    }

    getError() {
        return this.isValid() ? null : this.#errorText;
    }

}
