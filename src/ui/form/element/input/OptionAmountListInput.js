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
import Comparator from "../../../../util/helper/Comparator.js";
import TPL from "./OptionAmountListInput.js.html" assert {type: "html"};
import STYLE from "./OptionAmountListInput.js.css" assert {type: "css"};

/** visualization:
 * +---------------------------------+
 * | Search...                       | <-- filter list
 * +---------------------------------+
 * | +--------------------+--------+ |
 * | | Option 1           |      3 | | <-- interger input per option
 * | +--------------------+--------+ |
 * | | Option 2           |      0 | | <-- initial value is 0
 * | +--------------------+--------+ |
 * +---------------------------------+
 *
 * <option value="foobar">Foobar</option> substitution see "ImageSelect"
 */

/** target value output:
 * {
 *     [string=key]: [number=value]
 * }
 */

export default class OptionAmountListInput extends CustomFormElementDelegating {

    #value = {};

    #inputEl;

    #containerEl;

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
            this.value = {
                ...this.#value,
                [name]: value
            };
            event.preventDefault();
            event.stopPropagation();
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#inputEl.addEventListener("input", () => {
            const all = this.#containerEl.children;
            const regEx = new CharacterSearch(this.#inputEl.value);
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
        this.internals.setFormValue(this.#value);
        this.#resolveSlottedElements();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        // this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = super.value || "";
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
        return this.#value ?? super.value;
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
                    this.#inputEl.setAttribute(name, newValue);
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
        if (value != null && typeof value === "object") {
            for (const name in value) {
                const amount = value[name];
                const inputEl = this.#containerEl.querySelector(`input[name="${name}"]`);
                inputEl.value = amount;
            }
        } else {
            const inputElList = this.#containerEl.querySelectorAll(`input[name]`);
            for (const el of inputElList) {
                el.value = 0;
            }
        }
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
        this.#inputEl.value = "";
        this.#containerEl.innerHTML = "";
        this.#optionChangeEventManager.clearTargets();
        if (Object.keys(options).length === 0) {
            const emptyEl = document.createElement("div");
            emptyEl.id = "empty";
            emptyEl.innerHTML = "no entries";
            this.#containerEl.append(emptyEl);
        } else {
            for (const name in options) {
                const label = options[name];
                const optionEl = document.createElement("label");
                optionEl.className = "option";
                const labelEl = document.createElement("emc-i18n-label");
                labelEl.i18nValue = label;
                optionEl.append(labelEl);
                const inputEl = document.createElement("input");
                inputEl.type = "number";
                inputEl.name = name;
                optionEl.append(inputEl);
                this.#containerEl.append(optionEl);
                this.#optionChangeEventManager.addTarget(inputEl);
            }
            /* --- */
            if (this.sorted) {
                this.#sort();
            }
            this.#applyValue(this.#value);
        }
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

}

customElements.define("emc-input-option-amount-list", OptionAmountListInput);
