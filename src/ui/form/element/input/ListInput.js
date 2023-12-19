import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import SimpleDataProvider from "../../../../util/grid/provider/SimpleDataProvider.js";
import ModalDialog from "../../../modal/ModalDialog.js";
import "../../../grid/DataGrid.js";
import "./SearchField.js";
import TPL from "./ListInput.js.html" assert {type: "html"};
import STYLE from "./ListInput.js.css" assert {type: "css"};

export default class ListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager = new SimpleDataProvider();

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
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#addEl.addEventListener("click", async () => {
            let rowName = null;
            const value = this.value ?? [];
            while (rowName == null) {
                rowName = await ModalDialog.prompt("Add item", "Please enter a new key");
                if (typeof rowName !== "string") {
                    return;
                }
                if (value.includes(rowName)) {
                    await ModalDialog.alert("Key already exists", `The key "${rowName}" does already exist. Please enter another one!`);
                    rowName = null;
                }
            }
            this.value = [...value, rowName];
        });
        this.#gridEl.addEventListener("delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowName} = event.data;
            const currentValue = {...this.#value};
            if (rowName in currentValue) {
                delete currentValue[rowName];
            }
            this.value = currentValue;
        });
        /* --- */
        this.#searchEl.addEventListener("change", () => {
            this.#fillGrid();
        }, true);
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#value = value;
        this.#applyValue(value ?? []);
        this.internals.setFormValue(value);
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

    static get observedAttributes() {
        return ["value", "readonly"];
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
        }
    }

    #applyValue(value) {
        const data = value.map((row) => {
            return {
                name: row
            }
        });
        this.#dataManager.setSource(data);
        this.#fillGrid();
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

}

customElements.define("emc-input-list", ListInput);
