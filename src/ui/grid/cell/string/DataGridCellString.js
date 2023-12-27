import {
    debounce
} from "../../../../util/Debouncer.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import DataGridCell from "../DataGridCell.js";
import "../../../i18n/builtin/I18nInput.js";
import TPL from "./DataGridCellString.js.html" assert {type: "html"};
import STYLE from "./DataGridCellString.js.css" assert {type: "css"};

export default class DataGridCellString extends DataGridCell {

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
            }
        }
    }

    onValueChange(value) {
        if (value != null && value != "") {
            this.classList.remove("empty");
            this.#valueEl.innerText = value;
            this.#valueEl.title = value;
            this.#inputEl.value = value;
        } else {
            this.classList.add("empty");
            this.#valueEl.innerText = "";
            this.#valueEl.title = "";
            this.#inputEl.value = "";
        }
    }

    #onInput = debounce((event) => {
        event.stopPropagation();
        event.preventDefault();
        const value = this.#inputEl.value;
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

DataGridCell.registerCellType("string", DataGridCellString, 200);
customElements.define("emc-grid-datagrid-cell-string", DataGridCellString);
