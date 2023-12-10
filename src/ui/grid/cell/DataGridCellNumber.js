
import {
    debounce
} from "../../../util/Debouncer.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import DataGridCell from "./DataGridCell.js";
import "../../i18n/builtin/I18nInput.js";
import TPL from "./DataGridCellNumber.js.html" assert {type: "html"};
import STYLE from "./DataGridCellNumber.js.css" assert {type: "css"};

export default class DataGridCellNumber extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    constructor() {
        super();
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#inputEl = this.shadowRoot.getElementById("input");
        /* --- */
        this.#inputEventManager = new EventTargetManager(this.#inputEl);
        this.#inputEventManager.set("input", (event) => {
            this.#onInput(event);
        });
    }

    get action() {
        return this.getAttribute("action");
    }

    set action(val) {
        this.setAttribute("action", val);
    }

    get decimals() {
        return this.setIntAttribute("decimals");
    }

    set decimals(val) {
        this.getIntAttribute("decimals", val);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

    set editable(val) {
        this.setBooleanAttribute("editable", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "editable": {
                    if (this.editable) {
                        this.#inputEventManager.setActive(true);
                    } else {
                        this.#inputEventManager.setActive(false);
                    }
                } break;
                case "decimals": {
                    this.onValueChange(this.value);
                } break;
            }
        }
    }

    onValueChange(value) {
        if (this.decimals != null && this.decimals >= 0) {
            value = parseFloat(value) || 0;
            value = value.toFixed(this.decimals);
        }
        this.#valueEl.innerText = value;
        this.#inputEl.value = parseFloat(value);
    }

    #onInput = debounce((event) => {
        event.stopPropagation();
        event.preventDefault();
        let value = parseFloat(this.#inputEl.value);
        if (this.decimals != null && this.decimals >= 0) {
            value = parseFloat(value.toFixed(this.decimals));
        }
        this.value = value;
        const ev = new Event("edit", {bubbles: true});
        ev.data = {
            value,
            action: this.action,
            columnName: this.columnName,
            rowName: this.rowName
        };
        this.dispatchEvent(ev);
    }, 300);

}

DataGridCell.registerCellType("number", DataGridCellNumber);
customElements.define("emc-grid-datagrid-cell-number", DataGridCellNumber);
