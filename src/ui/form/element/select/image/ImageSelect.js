import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import ImageSelectModal from "./components/ImageSelectModal.js";
import "../../../../i18n/I18nLabel.js";
import "../../../../i18n/I18nTooltip.js";
import TPL from "./ImageSelect.js.html" assert {type: "html"};
import STYLE from "./ImageSelect.js.css" assert {type: "css"};

// TODO use modal handler
export default class ImageSelect extends CustomFormElementDelegating {

    #value;

    #iconEl;

    #textEl;

    #buttonEl;

    #imageIconModal = new ImageSelectModal();

    #optionNodeList = new ElementListCache();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#buttonEl.addEventListener("click", () => {
            this.#imageIconModal.value = this.value;
            this.#imageIconModal.onsubmit = () => {
                this.value = this.#imageIconModal.value;
            };
            this.#imageIconModal.show();
        });
    }

    connectedCallback() {
        const value = this.value;
        this.#value = value;
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = super.value || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? super.value;
    }

    set optiongroup(value) {
        this.setAttribute("optiongroup", value);
    }

    get optiongroup() {
        return this.getAttribute("optiongroup");
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set required(value) {
        this.setBooleanAttribute("required", value);
    }

    get required() {
        return this.getBooleanAttribute("required");
    }

    static get observedAttributes() {
        return ["name", "value", "optiongroup", "placeholder", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "name": {
                if (oldValue != newValue) {
                    this.#imageIconModal = ImageSelectModal.getModalByName(newValue);
                }
            } break;
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value === undefined) {
                        this.#applyValue(this.value);
                        this.internals.setFormValue(this.value);
                        /* --- */
                        this.dispatchEvent(new Event("change"));
                    }
                }
            } break;
            case "optiongroup": {
                if (oldValue != newValue) {
                    this.#imageIconModal.optiongroup = newValue;
                }
            } break;
            // case "placeholder": {
            //     if (oldValue != newValue) {
            //         this.#placeholderEl.setAttribute("i18n-value", newValue)
            //     }
            // } break;
        }
    }

    #applyValue(value) {
        if (value != null && value !== "") {
            this.#iconEl.style.backgroundImage = `url(${value})`;
            const selectedEl = this.#optionNodeList.querySelector(`[value="${value}"]`);
            if (selectedEl != null) {
                this.#textEl.i18nValue = selectedEl.i18nValue ?? selectedEl.innerHTML;
            } else {
                this.#textEl.i18nValue = value;
            }
        } else {
            this.#iconEl.style.backgroundImage = "";
            this.#textEl.i18nValue = "";
        }
    }

}

customElements.define("emc-select-image", ImageSelect);
