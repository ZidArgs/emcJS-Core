import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import MutationObserverManager from "../../../../../util/observer/MutationObserverManager.js";
import ImageSelectModal from "./components/ImageSelectModal.js";
import "../../../../i18n/I18nLabel.js";
import "../../../../i18n/I18nTooltip.js";
import TPL from "./ImageSelect.js.html" assert {type: "html"};
import STYLE from "./ImageSelect.js.css" assert {type: "css"};

const MUTATION_CONFIG = {
    attributes: true,
    characterData: true,
    attributeFilter: ["value"]
};

export default class ImageSelect extends CustomFormElementDelegating {

    #value;

    #iconEl;

    #textEl;

    #buttonEl;

    #optionsContainerEl;

    #imageIconModal = new ImageSelectModal();

    #optionNodeList = new ElementListCache();

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#textEl = this.shadowRoot.getElementById("text");
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
        return ["value", "placeholder", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
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

    #resolveSlottedOptions() {
        const res = {};
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        for (const el of optionNodeList) {
            res[el.value] = el.i18nValue ?? el.innerHTML;
            /* --- */
            if (oldNodes.has(el)) {
                oldNodes.delete(el);
            } else {
                newNodes.add(el);
            }
        }
        for (const node of oldNodes) {
            this.#mutationObserver.unobserve(node);
        }
        for (const node of newNodes) {
            this.#mutationObserver.observe(node);
        }
        return res;
    }

    #onSlotChange = debounce(() => {
        this.#imageIconModal.loadOptions(this.#resolveSlottedOptions());
        this.#applyValue(this.#imageIconModal.value);
    });

}

customElements.define("emc-select-image", ImageSelect);
