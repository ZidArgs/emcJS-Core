import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import SimpleDataProvider from "../../../../../util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "../../../../modal/ModalDialog.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/getFocusableElements.js";
import "../search/SearchInput.js";
import "../../../button/Button.js";
import "../../../../dataview/datagrid/DataGrid.js";
import TPL from "./ListInput.js.html" assert {type: "html"};
import STYLE from "./ListInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ListInput.js.json" assert {type: "json"};

export default class ListInput extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #labelEl;

    #searchEl;

    #gridEl;

    #addEl;

    #dataManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
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
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {key: this.#searchEl.value};
            }
            this.#dataManager.updateConfig(options);
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
        const value = this.getJSONAttribute("value");
        if (value != null && typeof value === "object") {
            if (Array.isArray(value)) {
                return value;
            }
            return Object.keys(value);
        }
        return [];
    }

    set value(value) {
        if (typeof value === "string") {
            value = JSON.parse(value);
        }
        if (value != null && typeof value === "object") {
            if (Array.isArray(value)) {
                super.value = value;
            } else {
                super.value = Object.keys(value);
            }
        } else {
            super.value = [];
        }
    }

    get value() {
        return super.value;
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
                    this.#gridEl.readonly = this.readonly;
                    this.#addEl.disabled = this.disabled || this.readonly;
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
        const data = value.map((row) => {
            return {key: row};
        });
        this.#dataManager.setSource(data);
    }

    #updateSort(value) {
        if (value) {
            this.#dataManager.setConfig({sort: ["key"]});
        } else {
            this.#dataManager.setConfig({sort: []});
        }
    }

    async #addElement() {
        let rowKey = null;
        const currentValue = this.value ?? [];
        while (rowKey == null) {
            rowKey = await ModalDialog.prompt("Add item", "Please enter a new key");
            if (typeof rowKey !== "string") {
                return;
            }
            if (currentValue.includes(rowKey)) {
                await ModalDialog.alert("Key already exists", `The key "${rowKey}" does already exist. Please enter another one!`);
                rowKey = null;
            }
        }
        this.value = [
            ...currentValue,
            rowKey
        ];
    }

    async #removeElement(rowKey) {
        const result = await ModalDialog.confirm("Remove entry", `Do you really want to remove the entry?\n\n${rowKey}`);
        if (result !== true) {
            return;
        }
        const currentValue = this.value;
        const index = currentValue.indexOf(rowKey);
        if (index >= 0) {
            this.value = currentValue.toSpliced(index, 1);
        }
    }

}

FormElementRegistry.register("ListInput", ListInput);
customElements.define("emc-input-list", ListInput);
registerFocusable("emc-input-list");
