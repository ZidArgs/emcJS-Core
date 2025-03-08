import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {
    deepClone
} from "../../../../../util/helper/DeepClone.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import {
    deleteAtIndexImmuted,
    moveInArrayImmuted
} from "../../../../../util/helper/collection/ArrayMutations.js";
import SimpleDataProvider from "../../../../../util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "../../../../modal/ModalDialog.js";
import Column from "../../../../dataview/datagrid/Column.js";
import "../../../../dataview/datagrid/DataGrid.js";
import "../search/SearchInput.js";
import "../../../button/Button.js";
import TPL from "./GridInput.js.html" assert {type: "html"};
import STYLE from "./GridInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./GridInput.js.json" assert {type: "json"};

export default class GridInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #labelEl;

    #searchEl;

    #gridEl;

    #sortColumn;

    #addEl;

    #dataManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.#sortColumn = this.shadowRoot.getElementById("sort-column");
        this.#addEl = this.shadowRoot.getElementById("add");
        this.#dataManager = new SimpleDataProvider(this.#gridEl);
        /* --- */
        this.#addEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.#addElement();
        });
        /* --- */
        this.#gridEl.addEventListener("action::delete", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            this.#removeElement(rowKey);
        });
        /* --- */
        this.#gridEl.addEventListener("edit", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {value, rowKey, columnName} = event.data;
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                const currentValue = [...this.value];
                const currentRow = {...currentValue[index]};
                currentRow[columnName] = value;
                currentValue[index] = currentRow;
                this.value = currentValue;
            }
        });
        /* --- */
        this.#gridEl.addEventListener("move-row-up", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index > 0) {
                this.value = moveInArrayImmuted(currentValue, index, index - 1);
            }
        });
        this.#gridEl.addEventListener("move-row-down", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {rowKey} = event.data;
            const currentValue = this.value ?? [];
            const index = this.#getElementIndex(rowKey);
            if (index + 1 < currentValue.length) {
                this.value = moveInArrayImmuted(currentValue, index, index + 1);
            }
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
        /* --- */
        this.#labelEl = this.shadowRoot.getElementById("label");
        this.#labelEl.addEventListener("click", (event) => {
            event.preventDefault();
            this.#searchEl.focus();
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#gridEl.disabled = disabled;
        this.#addEl.disabled = disabled || this.readonly;
    }

    focus(options) {
        this.#searchEl.focus(options);
    }

    set defaultValue(value) {
        this.setJSONAttribute("value", value);
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? [];
    }

    set value(value) {
        if (typeof value === "string") {
            value = JSON.parse(value);
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

    set stretched(value) {
        this.setAttribute("stretched", value);
    }

    get stretched() {
        return this.getAttribute("stretched");
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "readonly", "stretched", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    this.#gridEl.readonly = this.readonly;
                    this.#addEl.disabled = this.disabled || this.readonly;
                }
            } break;
            case "stretched": {
                if (oldValue != newValue) {
                    this.#gridEl.stretched = this.stretched;
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    this.#updateSort(this.sorted);
                }
            } break;
        }
    }

    renderValue(value) {
        const data = Object.entries(value).map((row) => {
            return {
                key: row[0],
                ...row[1]
            };
        });
        this.#dataManager.setSource(data);
    }

    #updateSort(value) {
        if (value && value !== "manual") {
            this.#dataManager.setOptions({
                sort: ["key"]
            });
        } else {
            this.#dataManager.setOptions({
                sort: []
            });
        }

        this.#sortColumn.hidden = value !== "manual";
    }

    async #addElement() {
        let rowKey = null;
        while (rowKey == null) {
            rowKey = await ModalDialog.prompt("Add item", "Please enter a new key");
            if (typeof rowKey !== "string") {
                return;
            }
            const index = this.#getElementIndex(rowKey);
            if (index >= 0) {
                await ModalDialog.alert("Key already exists", `The key "${rowKey}" does already exist. Please enter another one!`);
                rowKey = null;
            }
        }
        const currentValue = this.value ?? [];
        this.value = [
            ...currentValue,
            {key: rowKey}
        ];
    }

    async #removeElement(rowKey) {
        const result = await ModalDialog.confirm("Remove entry", `Do you really want to remove the entry?\n\n${rowKey}`);
        if (result !== true) {
            return;
        }
        const currentValue = this.value ?? [];
        const index = this.#getElementIndex(rowKey);
        if (index >= 0) {
            this.value = deleteAtIndexImmuted(currentValue, index);
        }
    }

    #getElementIndex(rowKey) {
        const currentValue = this.value ?? [];
        return currentValue.findIndex((entry) => {
            return rowKey === entry.key;
        });
    }

    static fromConfig(config) {
        const inputEl = new GridInput();
        const {columns = [], ...params} = config;

        for (const column of columns) {
            const columnEl = new Column();
            const {key = ""} = column;
            columnEl.name = key;
            if (key === "key") {
                const {caption = "", width = 0} = column;
                columnEl.type = "string";
                columnEl.caption = caption;
                columnEl.width = width;
                columnEl.editable = false;
            } else {
                const {type = "string", caption = "", width = 0, editable = false} = column;
                columnEl.type = type;
                columnEl.caption = caption;
                columnEl.width = width;
                columnEl.editable = editable;
            }
            inputEl.append(columnEl);
        }

        for (const name in params) {
            const value = params[name];
            safeSetAttribute(inputEl, name, value);
        }

        return inputEl;
    }

}

FormElementRegistry.register("GridInput", GridInput);
customElements.define("emc-input-grid", GridInput);
registerFocusable("emc-input-grid");
