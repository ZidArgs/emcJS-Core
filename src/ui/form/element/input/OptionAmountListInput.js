import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import i18n from "../../../../util/I18n.js";
// import CharacterSearch from "../../../../util/search/CharacterSearch.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import SimpleDataManager from "../../../../util/grid/data/SimpleDataManager.js";
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

    #gridEl;

    #optionsContainerEl;

    #i18nEventManager = new EventTargetManager(i18n);

    #dataManager = new SimpleDataManager();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#gridEl.addEventListener("editValue", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowName} = event.data;
            const currentValue = {...this.#value};
            if (rowName in currentValue) {
                currentValue[rowName] = value;
            }
            this.value = currentValue;
        }, 300));
        /* --- */
        this.#searchEl.addEventListener("change", () => {
            this.#fillGrid();
        }, true);
    }

    connectedCallback() {
        this.#resolveSlottedElements();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
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
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
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

    #applyValue() {
        const data = Object.entries(this.#value ?? {}).map((row) => {
            return {
                name: row[0],
                value: row[1]
            }
        });
        this.#gridEl.setData(data);
    }

    #sort = debounce(() => {
        // TODO
    });

    #resolveSlottedElements() {
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        /* --- */
        const options = [];
        const newValue = {};
        this.#searchEl.value = "";
        const value = this.value;
        const rows = [];
        for (const el of optionNodeList) {
            const option = el.value;
            options.push(option);
            /* --- */
            const amount = value?.[option] ?? 0;
            rows.push({
                name: option,
                value: amount
            });
            newValue[option] = amount;
        }
        /* --- */
        this.#dataManager.setSource(rows);
        this.#fillGrid();
        this.#options = options;
        this.value = newValue;
        /* --- */
        this.dispatchEvent(new Event("options"));
    }

    #fillGrid() {
        const options = {
            sort: ["name"]
        };
        if (this.#searchEl.value != "") {
            options.filter = {
                name: this.#searchEl.value
            };
        }
        this.#gridEl.setData(this.#dataManager.getData(options));
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

}

customElements.define("emc-input-option-amount-list", OptionAmountListInput);
