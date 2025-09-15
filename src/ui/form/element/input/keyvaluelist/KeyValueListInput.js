import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import SimpleDataProvider from "../../../../../util/dataprovider/SimpleDataProvider.js";
import ModalDialog from "../../../../modal/ModalDialog.js";
import "../search/SearchInput.js";
import "../../../button/Button.js";
import "../../../../dataview/datagrid/DataGrid.js";
import TPL from "./KeyValueListInput.js.html" assert {type: "html"};
import STYLE from "./KeyValueListInput.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./KeyValueListInput.js.json" assert {type: "json"};
import jsonParse from "../../../../../patches/JSONParser.js";

export default class KeyValueListInput extends AbstractFormElement {

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
        this.#gridEl.addEventListener("edit::value", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const {
                value, rowKey
            } = event.data;
            const currentValue = {...this.value};
            if (rowKey in currentValue) {
                currentValue[rowKey] = value;
            }
            this.value = currentValue;
        });
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {name: this.#searchEl.value};
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
        return this.getJSONAttribute("value") ?? {};
    }

    set value(value) {
        if (typeof value === "string") {
            value = jsonParse(value);
        }
        super.value = value;
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
        const data = Object.entries(value).map((row) => {
            return {
                key: row[0],
                name: row[0],
                value: row[1]
            };
        });
        this.#dataManager.setSource(data);
    }

    #updateSort(value) {
        if (value) {
            this.#dataManager.setConfig({sort: ["name"]});
        } else {
            this.#dataManager.setConfig({sort: []});
        }
    }

    async #addElement() {
        let rowKey = null;
        const currentValue = this.value ?? {};
        while (rowKey == null) {
            rowKey = await ModalDialog.prompt("Add item", "Please enter a new key");
            if (typeof rowKey !== "string") {
                return;
            }
            if (rowKey in currentValue) {
                await ModalDialog.alert("Key already exists", `The key "${rowKey}" does already exist. Please enter another one!`);
                rowKey = null;
            }
        }
        this.value = {
            ...currentValue,
            [rowKey]: ""
        };
    }

    async #removeElement(rowKey) {
        const result = await ModalDialog.confirm("Remove entry", `Do you really want to remove the entry?\n\n${rowKey}`);
        if (result !== true) {
            return;
        }
        const currentValue = {...this.value};
        if (rowKey in currentValue) {
            delete currentValue[rowKey];
            this.value = currentValue;
        }
    }

}

FormElementRegistry.register("KeyValueListInput", KeyValueListInput);
customElements.define("emc-input-keyvaluelist", KeyValueListInput);
registerFocusable("emc-input-keyvaluelist");
