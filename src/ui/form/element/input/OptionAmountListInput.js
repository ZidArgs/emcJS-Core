import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import EventMultiTargetManager from "../../../../util/event/EventMultiTargetManager.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import i18n from "../../../../util/I18n.js";
import CharacterSearch from "../../../../util/search/CharacterSearch.js";
import {
    sortNodeList
} from "../../../../util/helper/ui/NodeListSort.js";
import Comparator, {
    isEqual
} from "../../../../util/helper/Comparator.js";
import "./internal/SearchField.js";
import "../../../grid/DataGrid.js";
import TPL from "./OptionAmountListInput.js.html" assert {type: "html"};
import STYLE from "./OptionAmountListInput.js.css" assert {type: "css"};

/** TODO detect slotted attribute changes
 *  - if the content of child or the attributes change, react accordingly
 */

// TODO use DataGrid

export default class OptionAmountListInput extends CustomFormElementDelegating {

    #value;

    #options = [];

    #searchEl;

    #containerEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #optionChangeEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionChangeEventManager.set("change", (event) => {
            const {name, value} = event.target;
            const newValue = {...this.value};
            newValue[name] = parseInt(value) || 0;
            this.value = newValue;
            event.preventDefault();
            event.stopPropagation();
        });
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#searchEl.addEventListener("change", () => {
            const all = this.#containerEl.children;
            const regEx = new CharacterSearch(this.#searchEl.value);
            for (const el of all) {
                if (el.innerText.trim().match(regEx)) {
                    el.style.display = "";
                } else {
                    el.style.display = "none";
                }
            }
        }, true);
    }

    connectedCallback() {
        this.#resolveSlottedElements();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#scrollContainerEl.classList.toggle("scroll-disabled", disabled);
        const inputElList = this.#containerEl.querySelectorAll(`input[name]`);
        for (const el of inputElList) {
            el.disabled = disabled;
        }
    }

    formResetCallback() {
        this.value = super.value;
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    get defaultValue() {
        return this.getJSONAttribute("value");
    }

    set value(value) {
        if (!isEqual(this.value, value)) {
            this.#value = {...value};
            this.#applyValue(this.#value);
        }
    }

    get value() {
        const defValue = super.value;
        const curValue = this.#value;
        if (curValue != null) {
            if (defValue != null) {
                return {
                    ...defValue,
                    ...curValue
                };
            } else {
                return {
                    ...curValue
                };
            }
        } else if (defValue != null) {
            return {
                ...defValue
            };
        }
        return null;
    }

    getSubmitValue() {
        const res = {};
        const value = this.value;
        for (const option of this.#options) {
            res[option] = value?.[option] ?? 0;
        }
        return res;
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return ["value", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value === undefined) {
                        this.#applyValue(this.value);
                    }
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    const sorted = this.sorted;
                    this.#i18nEventManager.setActive(sorted);
                    if (sorted) {
                        this.#sort();
                    }
                }
            } break;
        }
    }

    #applyValue(value) {
        const formValue = {};
        const inputElList = this.#containerEl.querySelectorAll(`input[name]`);
        for (const el of inputElList) {
            const name = el.name;
            const amount = value?.[name] ?? 0;
            el.value = amount;
            formValue[name] = amount;
        }
        this.internals.setFormValue(JSON.stringify(formValue));
        /* --- */
        this.dispatchEvent(new Event("change"));
    }

    #sort = debounce(() => {
        const optionNodeList = this.#containerEl.children;
        const sortedNodeList = sortNodeList(optionNodeList);
        if (!Comparator.isEqual(optionNodeList, sortedNodeList)) {
            for (const el of sortedNodeList) {
                (el.parentElement ?? el.getRootNode() ?? document).append(el);
            }
        }
    });

    #resolveSlottedElements() {
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        /* --- */
        const options = {};
        for (const el of optionNodeList) {
            options[el.value] = el.i18nValue ?? el.innerHTML;
        }
        /* --- */
        const formValue = {};
        this.#searchEl.value = "";
        this.#containerEl.innerHTML = "";
        this.#optionChangeEventManager.clearTargets();
        this.#options = Object.keys(options);
        if (this.#options.length === 0) {
            const emptyEl = document.createElement("div");
            emptyEl.id = "empty";
            emptyEl.innerHTML = "no entries";
            this.#containerEl.append(emptyEl);
        } else {
            const value = this.value;
            for (const name in options) {
                const label = options[name];
                const amount = value?.[name] ?? 0;
                const optionEl = document.createElement("label");
                optionEl.className = "option";
                const labelEl = document.createElement("emc-i18n-label");
                labelEl.i18nValue = label;
                optionEl.append(labelEl);
                const inputEl = document.createElement("input");
                inputEl.type = "number";
                inputEl.name = name;
                inputEl.disabled = this.disabled;
                inputEl.value = amount;
                optionEl.append(inputEl);
                this.#containerEl.append(optionEl);
                this.#optionChangeEventManager.addTarget(inputEl);
                formValue[name] = amount;
            }
            /* --- */
            if (this.sorted) {
                this.#sort();
            }
        }
        this.internals.setFormValue(JSON.stringify(formValue));
        /* --- */
        this.dispatchEvent(new Event("options"));
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

}

customElements.define("emc-input-option-amount-list", OptionAmountListInput);
