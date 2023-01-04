import CustomElement from "../../element/CustomElement.js";
import "../../i18n/I18nLabel.js";
import "../../i18n/I18nTextbox.js";
import TPL from "./FormField.js.html" assert {type: "html"};
import STYLE from "./FormField.js.css" assert {type: "css"};

export default class FormField extends CustomElement {

    #isValid = true;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    set key(value) {
        this.setAttribute("key", value);
    }

    get key() {
        return this.getAttribute("key");
    }

    set value(value) {
        this.setAttribute("value", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get label() {
        return this.getAttribute("label");
    }

    set desc(value) {
        this.setAttribute("desc", value);
    }

    get desc() {
        return this.getAttribute("desc");
    }

    set desctt(value) {
        this.setAttribute("desctt", value);
    }

    get desctt() {
        return this.getAttribute("desctt");
    }

    static get observedAttributes() {
        return ["value", "label", "desc", "desctt"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#isValid = !!this.revalidate();
                    /* --- */
                    const event = new Event("change");
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = newValue;
                    event.valid = this.#isValid;
                    event.key = this.key;
                    this.dispatchEvent(event);
                }
            } break;
            case "label": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("text").i18nValue = newValue;
                }
            } break;
            case "desc": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("description").i18nContent = newValue;
                }
            } break;
            case "desctt": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("description").i18nTooltip = newValue;
                }
            } break;
        }
    }

    revalidate() {
        return true;
    }

    isValid() {
        return this.#isValid;
    }

}
