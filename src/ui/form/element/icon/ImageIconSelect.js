import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import ElementListCache from "../../../../util/html/ElementListCache.js";
import ImageIconModal from "./modal/ImageIconModal.js";
import TPL from "./ImageIconSelect.js.html" assert {type: "html"};
import STYLE from "./ImageIconSelect.js.css" assert {type: "css"};

// TODO dont use ImageIconPreview but build a sideways view [icon|label|...] where "..." is the choose button

export default class ImageIconSelect extends CustomFormElementDelegating {

    #value;

    #previewEl;

    #buttonEl;

    #optionsContainerEl;

    #imageIconModal = new ImageIconModal();

    #optionNodeList = new ElementListCache();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#previewEl = this.shadowRoot.getElementById("preview");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#buttonEl.addEventListener("click", () => {
            this.#imageIconModal.value = this.value;
            this.#imageIconModal.show();
        });
        this.#imageIconModal.addEventListener("submit", () => {
            this.value = this.#imageIconModal.value;
        });
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
    }

    connectedCallback() {
        const value = this.value;
        this.#value = value;
        this.#imageIconModal.loadOptions(this.#resolveSlottedOptions());
        this.internals.setFormValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (this.#value != value) {
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? this.getAttribute("value");
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

    #applyValue(value) {
        if (value !== "") {
            this.#previewEl.value = value;
            const selectedEl = this.#optionNodeList.querySelector(`[value="${value}"]`);
            if (selectedEl != null) {
                this.#previewEl.text = selectedEl.i18nValue ?? selectedEl.innerHTML;
            } else {
                this.#previewEl.text = value;
            }
        } else {
            this.#previewEl.value = "";
            this.#previewEl.text = "";
        }
    }

    #resolveSlottedOptions() {
        const res = {};
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        for (const el of optionNodeList) {
            res[el.value] = el.i18nValue ?? el.innerHTML;
        }
        return res;
    }

    #onSlotChange = debounce(() => {
        this.#imageIconModal.loadOptions(this.#resolveSlottedOptions());
        this.#applyValue(this.#imageIconModal.value);
    });

}

customElements.define("emc-select-icon-image", ImageIconSelect);
