import AbstractFormElement from "../../AbstractFormElement.js";
import DataReceiverMixin from "../../../../../util/dataprovider/DataReceiverMixin.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {setAttributes} from "../../../../../util/helper/ui/NodeAttributes.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import i18n from "../../../../../util/I18n.js";
import jsonParse from "../../../../../patches/JSONParser.js";
import Column from "../../../../dataview/datagrid/Column.js";
import "../../../../dataview/datagrid/DataGrid.js";
import "../../input/search/SearchInput.js";
import TPL from "./GridSelect.js.html" assert {type: "html"};
import STYLE from "./GridSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./GridSelect.js.json" assert {type: "json"};

export default class GridSelect extends DataReceiverMixin(AbstractFormElement) {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    static get changeDebounceTime() {
        return 0;
    }

    #searchEl;

    #gridEl;

    #i18nEventManager = new EventTargetManager(i18n, false);

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#gridEl = this.shadowRoot.getElementById("grid");
        this.registerTargetEventHandler(this.#gridEl, "selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.value = event.data;
        });
        /* --- */
        this.registerTargetEventHandler(this.#gridEl, "sort", (event) => {
            event.stopPropagation();
            const {columnName} = event.data;
            const ev = new Event("sort");
            ev.data = {columnName};
            this.dispatchEvent(ev);
        });
        this.registerTargetEventHandler(this.#gridEl, "unsort", (event) => {
            event.stopPropagation();
            const {columnName} = event.data;
            const ev = new Event("unsort");
            ev.data = {columnName};
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.registerTargetEventHandler(this.#searchEl, "change", () => {
            const search = this.#searchEl.value;
            const ev = new Event("search");
            ev.data = {search};
            this.dispatchEvent(ev);
        }, true);
        /* --- */
        this.#i18nEventManager.set(["language", "translation"], () => {
            this.dispatchEvent(new Event("refresh"));
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#gridEl.disabled = disabled;
    }

    focus(options) {
        super.focus(options);
        this.#searchEl.focus(options);
    }

    async setData(data) {
        this.#gridEl.setData(data);
    }

    set defaultValue(value) {
        this.setJSONAttribute("value", value);
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? [];
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

    set multiple(val) {
        this.setBooleanAttribute("multiple", val);
    }

    get multiple() {
        return this.getBooleanAttribute("multiple");
    }

    set allowDeselect(value) {
        this.setBooleanAttribute("allowdeselect", value);
    }

    get allowDeselect() {
        return this.getBooleanAttribute("allowdeselect");
    }

    set selectEnd(value) {
        this.setBooleanAttribute("selectend", value);
    }

    get selectEnd() {
        return this.getBooleanAttribute("selectend");
    }

    set stretched(value) {
        this.setAttribute("stretched", value);
    }

    get stretched() {
        return this.getAttribute("stretched");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "readonly", "sorted", "multiple", "allowdeselect", "selectend", "stretched"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    this.#gridEl.readonly = this.readonly;
                }
            } break;
            case "multiple": {
                if (oldValue != newValue) {
                    this.#gridEl.multiple = this.multiple;
                }
            } break;
            case "allowdeselect": {
                if (oldValue != newValue) {
                    this.#gridEl.allowDeselect = this.allowDeselect;
                }
            } break;
            case "selectend": {
                if (oldValue != newValue) {
                    this.#gridEl.selectEnd = this.selectEnd;
                }
            } break;
            case "stretched": {
                if (oldValue != newValue) {
                    this.#gridEl.stretched = this.stretched;
                }
            } break;
        }
    }

    renderValue(value) {
        this.#gridEl.setSelected(value);
    }

    static fromConfig(config) {
        const selectEl = new GridSelect();
        const {
            columns = {}, options = [], ...params
        } = config;

        setAttributes(selectEl, params);

        for (const column of columns) {
            const columnEl = new Column();
            const {key = ""} = column;
            columnEl.name = key;
            if (key === "key") {
                const {
                    caption = "", width = 0
                } = column;
                columnEl.type = "string";
                columnEl.caption = caption;
                columnEl.width = width;
                columnEl.editable = false;
            } else {
                const {
                    type = "string", caption = "", width = 0, editable = false
                } = column;
                columnEl.type = type;
                columnEl.caption = caption;
                columnEl.width = width;
                columnEl.editable = editable;
            }
            selectEl.append(columnEl);
        }

        selectEl.setData(options);

        return selectEl;
    }

    busy() {
        this.#gridEl.busy();
    }

    unbusy() {
        this.#gridEl.unbusy();
    }

}

FormElementRegistry.register("GridSelect", GridSelect);
customElements.define("emc-select-grid", GridSelect);
registerFocusable("emc-select-grid");
