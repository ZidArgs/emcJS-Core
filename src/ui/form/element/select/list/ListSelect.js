import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import SimpleDataProvider from "../../../../../util/dataprovider/SimpleDataProvider.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {debounce} from "../../../../../util/Debouncer.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {setAttributes} from "../../../../../util/helper/ui/NodeAttributes.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import MutationObserverManager from "../../../../../util/observer/manager/MutationObserverManager.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import i18n from "../../../../../util/I18n.js";
import jsonParse from "../../../../../patches/JSONParser.js";
import I18nOption from "../../../../i18n/builtin/I18nOption.js";
import "./components/SelectionList.js";
import TPL from "./ListSelect.js.html" assert {type: "html"};
import STYLE from "./ListSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ListSelect.js.json" assert {type: "json"};

const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["value"]
};

// TODO rename to gridselect
// TODO add option to choose visible columns
// TODO build real listselect similar to the old one (maybe use select in multiple mode)
export default class ListSelect extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    static get changeDebounceTime() {
        return 0;
    }

    #headerEl;

    #searchEl;

    #listEl;

    #headerSelectEl;

    #dataManager;

    #optionsContainerEl;

    #optionNodeList = new ElementListCache();

    #i18nEventManager = new EventTargetManager(i18n, false);

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.registerTargetEventHandler(this.#optionsContainerEl, "slotchange", () => {
            this.#onSlotChange();
        });
        this.#headerEl = this.shadowRoot.getElementById("header");
        /* --- */
        this.#listEl = this.shadowRoot.getElementById("list");
        this.registerTargetEventHandler(this.#listEl, "selection", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.value = event.data;
        });
        /* --- */
        this.#headerSelectEl = document.createElement("input");
        this.#headerSelectEl.type = "checkbox";
        this.#headerSelectEl.name = "multiselect";
        this.#headerSelectEl.className = "multi-select";
        this.#headerEl.prepend(this.#headerSelectEl);
        this.registerTargetEventHandler(this.#headerSelectEl, "change", () => {
            const value = this.#headerSelectEl.checked;
            if (value) {
                this.#listEl.selectAll();
            } else {
                this.#listEl.clearSelected();
            }
        });
        this.registerTargetEventHandler(this.#listEl, "selection-header", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.#headerSelectEl.checked = event.checked;
            this.#headerSelectEl.indeterminate = event.indeterminate;
        });
        /* --- */
        this.#dataManager = new SimpleDataProvider(this.#listEl);
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.registerTargetEventHandler(this.#searchEl, "change", () => {
            const options = {filter: {}};
            if (this.#searchEl.value != "") {
                options.filter = {name: this.#searchEl.value};
            }
            this.#dataManager.updateConfig(options);
        }, true);
        /* --- */
        this.#i18nEventManager.set("language", () => {
            this.#dataManager.refresh();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#dataManager.refresh();
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#onSlotChange();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#searchEl.disabled = disabled;
        this.#listEl.disabled = disabled;
        this.#headerSelectEl.disabled = disabled;
    }

    focus(options) {
        super.focus(options);
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

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "readonly", "sorted", "multiple", "allowdeselect", "selectend"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    const value = newValue != null && newValue != "false";
                    this.#listEl.readonly = value;
                    this.#headerSelectEl.readonly = value;
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    this.#updateSort(this.sorted);
                }
            } break;
            case "multiple": {
                if (oldValue != newValue) {
                    this.#listEl.multiple = this.multiple;
                }
            } break;
            case "allowdeselect": {
                if (oldValue != newValue) {
                    this.#listEl.allowDeselect = this.allowDeselect;
                }
            } break;
            case "selectend": {
                if (oldValue != newValue) {
                    this.#listEl.selectEnd = this.selectEnd;
                    if (this.selectEnd) {
                        this.#headerEl.append(this.#headerSelectEl);
                    } else {
                        this.#headerEl.prepend(this.#headerSelectEl);
                    }
                }
            } break;
        }
    }

    renderValue(value) {
        this.#listEl.setSelected(value);
    }

    #updateSort(value) {
        if (value) {
            this.#i18nEventManager.active = true;
            this.#dataManager.setConfig({sortFunction: (record0, record1) => i18n.compareNumberedValuesTranslated(record0.name, record1.name)});
        } else {
            this.#i18nEventManager.active = false;
            this.#dataManager.setConfig({sortFunction: false});
        }
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
                key: el.value || el.innerText,
                name: el.i18nValue || el.label || el.innerText
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

    static fromConfig(config) {
        const selectEl = new ListSelect();
        const {
            options = {}, ...params
        } = config;

        setAttributes(selectEl, params);

        for (const key in options) {
            const value = options[key];
            const optionEl = I18nOption.create();
            optionEl.value = key;
            if (value) {
                optionEl.i18nValue = value;
            }
            selectEl.append(optionEl);
        }

        return selectEl;
    }

}

FormElementRegistry.register("ListSelect", ListSelect);
customElements.define("emc-select-list", ListSelect);
registerFocusable("emc-select-list");
