import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import SimpleDataProvider from "../../../../../util/dataprovider/SimpleDataProvider.js";
import MutationObserverManager from "../../../../../util/observer/MutationObserverManager.js";
import "../../input/search/SearchInput.js";
import "../../../../grid/DataGrid.js";
import TPL from "./ListSelect.js.html" assert {type: "html"};
import STYLE from "./ListSelect.js.css" assert {type: "css"};

const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["value"]
};

export default class ListSelect extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #dataManager;

    #optionsContainerEl;

    #optionNodeList = new ElementListCache();

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("keydown", () => {
            // TODO
        });
        this.addEventListener("blur", (event) => {
            // TODO
            event.stopPropagation();
        });
        /* --- */
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.value = event.data;
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        this.#dataManager.setOptions({
            sort: ["name"]
        });
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
        super.connectedCallback();
        const value = this.value;
        this.#value = value;
        this.#applyValue(value ?? []);
        this.internals.setFormValue(value);
        this.#gridEl.selectable = this.multi ? "multi" : "single";
        if (this.header === "show") {
            this.#gridEl.nohead = "false";
        } else if (this.header === "hide") {
            this.#gridEl.nohead = "true";
        } else {
            this.#gridEl.nohead = this.multi ? "false" : "true";
        }
        this.#updateSort(this.sorted);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        // TODO disable grid
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
            this.#applyValue(value ?? []);
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

    set multi(val) {
        this.setBooleanAttribute("multi", val);
    }

    get multi() {
        return this.getBooleanAttribute("multi");
    }

    set header(val) {
        this.setAttribute("header", val);
    }

    get header() {
        return this.getAttribute("header");
    }

    static get observedAttributes() {
        return ["value", "readonly", "sorted", "multi", "header"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value == null) {
                        try {
                            this.#applyValue(JSON.parse(newValue));
                        } catch {
                            this.#applyValue([]);
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
            case "multi": {
                if (oldValue != newValue) {
                    this.#gridEl.selectable = this.multi ? "multi" : "single";
                    if (this.header !== "hide" && this.header !== "show") {
                        this.#gridEl.nohead = this.multi ? "false" : "true";
                    }
                }
            } break;
            case "header": {
                if (oldValue != newValue) {
                    if (newValue === "show") {
                        this.#gridEl.nohead = "false";
                    } else if (newValue === "hide") {
                        this.#gridEl.nohead = "true";
                    } else {
                        this.#gridEl.nohead = this.multi ? "false" : "true";
                    }
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

    #applyValue(value) {
        this.#gridEl.setSelected(value);
    }

    #onSlotChange = debounce(async () => {
        await BusyIndicatorManager.busy();
        const data = [];
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        for (const el of optionNodeList) {
            data.push({
                name: el.value
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
        this.#dataManager.setSource(data);
        await BusyIndicatorManager.unbusy();
    });

}

customElements.define("emc-select-list", ListSelect);
