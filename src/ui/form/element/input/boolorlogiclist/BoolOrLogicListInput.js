import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import SimpleDataProvider from "../../../../../util/dataprovider/SimpleDataProvider.js";
import MutationObserverManager from "../../../../../util/observer/MutationObserverManager.js";
import LogicElementModal from "../logic/components/modal/LogicElementModal.js";
import "../search/SearchInput.js";
import "../../../../dataview/datagrid/DataGrid.js";
import TPL from "./BoolOrLogicListInput.js.html" assert {type: "html"};
import STYLE from "./BoolOrLogicListInput.js.css" assert {type: "css"};

const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["value"]
};

export default class BoolOrLogicListInput extends CustomFormElementDelegating {

    #value;

    #options = [];

    #operatorGroups = new Set();

    #searchEl;

    #gridEl;

    #optionsContainerEl;

    #dataManager;

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("edit::value", debounce((event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey} = event.data;
            const currentValue = {...this.#value};
            if (rowKey in currentValue) {
                currentValue[rowKey] = value;
            }
            this.value = currentValue;
        }, 300));
        this.#gridEl.addEventListener("rows-updated", () => {
            const logicEls = this.#gridEl.getAllCellsForColumn("value");
            for (const logicEl of logicEls) {
                logicEl.addOperatorGroup(...this.#operatorGroups);
            }
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {
                    name: this.#searchEl.value
                };
            }
            this.#dataManager.updateOptions(options);
        }, true);
    }

    connectedCallback() {
        this.#updateSort(this.sorted);
        this.#resolveSlottedElements();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        // TODO disable grid
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
        return ["value", "readonly", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value == null) {
                        try {
                            this.#applyValue(JSON.parse(newValue));
                        } catch {
                            this.#applyValue({});
                        }
                    }
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    // TODO make everything readonly
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    this.#updateSort(this.sorted);
                }
            } break;
        }
    }

    #updateSort(value) {
        if (value) {
            this.#dataManager.setOptions({
                sort: ["name"]
            });
        } else {
            this.#dataManager.setOptions({
                sort: []
            });
        }
    }

    async #resolveSlottedElements() {
        await BusyIndicatorManager.busy();
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
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
                key: option,
                name: option,
                value: amount
            });
            newValue[option] = amount;
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
        this.#dataManager.setSource(rows);
        this.#options = options;
        this.value = newValue;
        /* --- */
        this.dispatchEvent(new Event("options"));
        await BusyIndicatorManager.unbusy();
    }

    #applyValue() {
        const curValue = this.#value;
        const data = this.#options.map((name) => {
            return {
                key: name,
                name,
                value: curValue[name] ?? false
            };
        });
        this.#dataManager.setSource(data);
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

    async addOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-value`);
        modal.addOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

    async removeOperatorGroup(...groupList) {
        await BusyIndicatorManager.busy();
        const gridId = this.#gridEl.internalId;
        const modal = LogicElementModal.getModalByName(`${gridId}-value`);
        modal.removeOperatorGroup(...groupList);
        await BusyIndicatorManager.unbusy();
    }

}

customElements.define("emc-input-boolorlogic-list", BoolOrLogicListInput);
