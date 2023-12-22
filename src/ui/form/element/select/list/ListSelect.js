import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import SimpleDataProvider from "../../../../../util/grid/provider/SimpleDataProvider.js";
import "../../../../grid/DataGrid.js";
import "../../input/search/SearchInput.js";
import TPL from "./ListSelect.js.html" assert {type: "html"};
import STYLE from "./ListSelect.js.css" assert {type: "css"};

export default class ListSelect extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #dataManager;

    #optionsContainerEl;

    #optionNodeList = new ElementListCache();

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
        return ["value", "readonly", "multi", "header"];
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

    #applyValue(value) {
        this.#gridEl.setSelected(value);
    }

    #onSlotChange = debounce(() => {
        const data = [];
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        for (const el of optionNodeList) {
            data.push({
                name: el.value
            });
        }
        this.#dataManager.setSource(data);
    });

}

customElements.define("emc-select-list", ListSelect);
