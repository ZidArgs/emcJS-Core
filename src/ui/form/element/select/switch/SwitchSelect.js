import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../../../util/I18n.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {
    nodeTextComparator,
    sortChildren
} from "../../../../../util/helper/ui/NodeListSort.js";
import {debounce} from "../../../../../util/Debouncer.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {safeSetAttribute} from "../../../../../util/helper/ui/NodeAttributes.js";
import MutationObserverManager from "../../../../../util/observer/manager/MutationObserverManager.js";
import I18nOption from "../../../../i18n/builtin/I18nOption.js";
import SwitchButtonManager from "./manager/SwitchButtonManager.js";
import "../../../../i18n/builtin/I18nInput.js";
import "../../../../i18n/I18nLabel.js";
import TPL from "./SwitchSelect.js.html" assert {type: "html"};
import STYLE from "./SwitchSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SwitchSelect.js.json" assert {type: "json"};

const MUTATION_CONFIG = {
    attributes: true,
    characterData: true,
    attributeFilter: ["value", "label"]
};

export default class SwitchSelect extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    static get changeDebounceTime() {
        return 0;
    }

    #fieldEl;

    #inputEl;

    #optionsContainerEl;

    #optionsSlotEl;

    #optionSelectEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n, false);

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    #switchButtonManager;

    constructor() {
        super();
        this.#fieldEl = this.shadowRoot.getElementById("field");
        this.#fieldEl.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionSelectEventManager.set("click", (event) => {
            const targetEl = event.currentTarget;
            this.value = targetEl.value;
            event.preventDefault();
            event.stopPropagation();
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsSlotEl = this.shadowRoot.getElementById("options-slot");
        this.#optionsSlotEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#switchButtonManager = new SwitchButtonManager(this.#optionsContainerEl, this.#optionSelectEventManager);
        this.#switchButtonManager.addEventListener("afterrender", () => {
            this.renderValue(this.value);
        });
        /* --- */
        this.#i18nEventManager.set("language", () => {
            this.#sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#sort();
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        const children = this.#optionsContainerEl.children;
        for (const child of children) {
            child.disabled = disabled;
        }
    }

    focus(options) {
        const children = this.#optionsContainerEl.children;
        const child = children[0];
        if (child != null) {
            child.focus(options);
        }
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "readonly", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    const optionEls = this.#optionsContainerEl.children;
                    for (const optionEl of optionEls) {
                        safeSetAttribute(optionEl, "readonly", newValue);
                    }
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    const sorted = this.sorted;
                    this.#i18nEventManager.active = sorted;
                    if (sorted) {
                        this.#switchButtonManager.registerSortFunction(this.#sortByNameFunction);
                    } else {
                        this.#switchButtonManager.registerSortFunction();
                    }
                }
            } break;
        }
    }

    renderValue(value) {
        const oldSelectedEl = this.#optionsContainerEl.querySelector(".selected");
        if (oldSelectedEl != null) {
            oldSelectedEl.classList.remove("selected");
        }
        if (value != null && value !== "") {
            const selectedEl = this.#optionsContainerEl.querySelector(`[value="${value}"]`);
            if (selectedEl != null) {
                selectedEl.classList.add("selected");
                if (selectedEl.label != null) {
                    this.#inputEl.i18nValue = selectedEl.label;
                } else {
                    this.#inputEl.i18nValue = "";
                    this.#inputEl.innerText = selectedEl.innerText;
                }
            } else {
                this.#inputEl.i18nValue = value;
            }
        } else {
            this.#inputEl.i18nValue = "";
            this.#inputEl.innerHTML = "";
        }
    }

    #sort = debounce(() => {
        sortChildren(this.#optionsContainerEl);
    });

    async #resolveSlottedElements() {
        await BusyIndicatorManager.busy();
        const data = [];
        const optionNodeList = this.#optionsSlotEl.assignedElements({flatten: true}).filter((el) => el.matches("option"));
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        for (const el of optionNodeList) {
            data.push({
                key: el.value || el.innerText,
                label: el.i18nValue || el.label || el.innerText,
                readonly: this.readonly
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
        this.#switchButtonManager.manage(data);
        /* --- */
        await BusyIndicatorManager.unbusy();
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

    #sortByNameFunction(entry0, entry1) {
        const {element: el0} = entry0;
        const {element: el1} = entry1;
        return nodeTextComparator(el0, el1);
    }

    static fromConfig(config) {
        const selectEl = new SwitchSelect();
        const {
            options = {}, ...params
        } = config;

        for (const value in options) {
            const optionEl = I18nOption.create();
            optionEl.value = value;
            const label = options[value];
            if (typeof label === "string" && label !== "") {
                optionEl.i18nValue = label;
            } else if (value !== "") {
                optionEl.i18nValue = value;
            }
            selectEl.append(optionEl);
        }

        for (const name in params) {
            const value = params[name];
            safeSetAttribute(selectEl, name, value);
        }

        return selectEl;
    }

}

FormElementRegistry.register("SwitchSelect", SwitchSelect);
customElements.define("emc-select-switch", SwitchSelect);
registerFocusable("emc-select-switch");
