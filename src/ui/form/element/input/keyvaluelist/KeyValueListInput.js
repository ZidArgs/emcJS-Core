import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import SimpleDataProvider from "../../../../../util/grid/provider/SimpleDataProvider.js";
import ModalDialog from "../../../../modal/ModalDialog.js";
import "../search/SearchInput.js";
import "../../../button/Button.js";
import "../../../../grid/DataGrid.js";
import TPL from "./KeyValueListInput.js.html" assert {type: "html"};
import STYLE from "./KeyValueListInput.js.css" assert {type: "css"};

// TODO make values editable
// TODO add readonly mode

export default class KeyValueListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

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
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#gridEl.addEventListener("action::delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowName} = event.data;
            const currentValue = {...this.#value};
            if (rowName in currentValue) {
                delete currentValue[rowName];
                this.value = currentValue;
            }
        });
        this.#gridEl.addEventListener("edit::value", debounce((event) => {
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
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let rowName = null;
            const currentValue = this.value ?? {};
            while (rowName == null) {
                rowName = await ModalDialog.prompt("Add item", "Please enter a new key");
                if (typeof rowName !== "string") {
                    return;
                }
                if (rowName in currentValue) {
                    await ModalDialog.alert("Key already exists", `The key "${rowName}" does already exist. Please enter another one!`);
                    rowName = null;
                }
            }
            this.value = {
                ...currentValue,
                [rowName]: ""
            };
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
        this.#applyValue(value ?? {});
        this.internals.setFormValue(value);
        this.#updateSort(this.sorted);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#addEl.disabled = disabled;
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
            this.#applyValue(value ?? {});
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

    #applyValue(value) {
        const data = Object.entries(value).map((row) => {
            return {
                name: row[0],
                value: row[1]
            }
        });
        this.#dataManager.setSource(data);
    }

}

customElements.define("emc-input-key-value-list", KeyValueListInput);
