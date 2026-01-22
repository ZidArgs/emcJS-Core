import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {debounce} from "../../../../../util/Debouncer.js";
import {nodeTextComparator} from "../../../../../util/helper/ui/NodeListSort.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {
    safeSetAttribute, setAttributes
} from "../../../../../util/helper/ui/NodeAttributes.js";
import MutationObserverManager from "../../../../../util/observer/manager/MutationObserverManager.js";
import ImageSelectModal from "./components/ImageSelectModal.js";
import I18nOption from "../../../../i18n/builtin/I18nOption.js";
import i18n from "../../../../../util/I18n.js";
import ImageSelectPreviewManager from "./components/ImageSelectPreviewManager.js";
import TPL from "./ImageSelect.js.html" assert {type: "html"};
import STYLE from "./ImageSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ImageSelect.js.json" assert {type: "json"};

const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["value", "label"]
};

// TODO use option slot like the other select elements
export default class ImageSelect extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    static get changeDebounceTime() {
        return 0;
    }

    #iconEl;

    #inputEl;

    #buttonEl;

    #optionsSlotEl;

    #imageIconModal = new ImageSelectModal();

    #i18nEventManager = new EventTargetManager(i18n);

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    #imageSelectPreviewManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.registerTargetEventHandler(this.#inputEl, "focus", () => {
            this.#buttonEl.focus();
        });
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.registerTargetEventHandler(this.#buttonEl, "click", () => {
            this.#imageIconModal.value = this.value;
            this.#imageIconModal.onsubmit = () => {
                this.value = this.#imageIconModal.value;
            };
            this.#imageIconModal.show();
        });
        this.#optionsSlotEl = this.shadowRoot.getElementById("options-slot");
        this.registerTargetEventHandler(this.#optionsSlotEl, "slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#imageSelectPreviewManager = new ImageSelectPreviewManager(this.#imageIconModal);
        this.registerTargetEventHandler(this.#imageSelectPreviewManager, "afterrender", () => {
            this.renderValue(this.value);
        });
        /* --- */
        this.#i18nEventManager.active = this.getBooleanAttribute("sorted");
        this.#i18nEventManager.set("language", () => {
            this.#imageSelectPreviewManager.sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#imageSelectPreviewManager.sort();
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#onSlotChange();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    validityCallback(message) {
        this.#inputEl.setCustomValidity(message);
    }

    focus(options) {
        super.focus(options);
        this.#inputEl.focus(options);
    }

    set value(value) {
        this.#inputEl.value = value ?? this.defaultValue;
        super.value = value;
    }

    get value() {
        return super.value;
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "placeholder", "readonly", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "i18n-placeholder", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, name, newValue);
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    const sorted = this.sorted;
                    if (sorted) {
                        this.#imageSelectPreviewManager.registerSortFunction(this.#sortByNameFunction);
                    } else {
                        this.#imageSelectPreviewManager.registerSortFunction();
                    }
                }
            } break;
        }
    }

    renderValue(value) {
        if (value != null && value !== "") {
            this.#iconEl.style.backgroundImage = `url(${value})`;
            this.#inputEl.value = value;
        } else {
            this.#iconEl.style.backgroundImage = "";
            this.#inputEl.value = "";
        }
    }

    #onSlotChange = debounce(async () => {
        await BusyIndicatorManager.busy();
        const data = [];
        const optionNodeList = this.#optionsSlotEl.assignedElements({flatten: true}).filter((el) => el.matches("option"));
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        for (const el of optionNodeList) {
            data.push({
                key: el.value || el.innerText,
                label: el.i18nValue || el.label || el.innerText
            });
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
        /* --- */
        this.#imageSelectPreviewManager.manage(data);
        /* --- */
        this.renderValue(this.value);
        await BusyIndicatorManager.unbusy();
    });

    #sortByNameFunction(entry0, entry1) {
        const {element: el0} = entry0;
        const {element: el1} = entry1;
        return nodeTextComparator(el0, el1);
    }

    static fromConfig(config) {
        const selectEl = new ImageSelect();
        const {
            options = {}, ...params
        } = config;

        setAttributes(selectEl, params);

        for (const key in options) {
            const value = options[key];
            const optionEl = I18nOption.create();
            optionEl.value = key;
            if (value) {
                optionEl.i18nValue = value;
            }
            selectEl.append(optionEl);
        }

        return selectEl;
    }

}

FormElementRegistry.register("ImageSelect", ImageSelect);
customElements.define("emc-select-image", ImageSelect);
registerFocusable("emc-select-image");
