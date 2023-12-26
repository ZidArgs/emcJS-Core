import {
    debounce
} from "../../../../util/Debouncer.js";
import OptionGroupRegistry from "../../../../data/registry/form/OptionGroupRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import DataGridCell from "../DataGridCell.js";
import "../../../form/element/select/image/ImageSelect.js";
import TPL from "./DataGridCellImage.js.html" assert {type: "html"};
import STYLE from "./DataGridCellImage.js.css" assert {type: "css"};

export default class DataGridCellImage extends DataGridCell {

    #valueEl;

    #inputEl;

    #inputEventManager;

    #optionGroup = null;

    #optionGroupEventTargetManager = new EventTargetManager();

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

    set optiongroup(value) {
        this.setAttribute("optiongroup", value);
    }

    get optiongroup() {
        return this.getAttribute("optiongroup");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "editable", "optiongroup"];
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
                case "optiongroup": {
                    if (newValue == null || newValue === "") {
                        this.#optionGroup = null;
                    } else {
                        this.#optionGroup = new OptionGroupRegistry(newValue);
                    }
                    this.#optionGroupEventTargetManager.switchTarget(this.#optionGroup);
                    this.#loadOptionsFromGroup();
                } break;
            }
        }
    }

    onValueChange(value) {
        if (value != null && value != "") {
            this.classList.remove("empty");
            this.#valueEl.innerText = value;
            this.#inputEl.value = value;
        } else {
            this.classList.add("empty");
            this.#valueEl.innerText = "";
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

    #loadOptionsFromGroup() {
        this.innerHTML = "";
        if (this.#optionGroup != null) {
            for (const [value, label] of this.#optionGroup) {
                const optionEl = document.createElement("option");
                optionEl.setAttribute("value", value);
                if (typeof label === "string" && label !== "") {
                    optionEl.innerHTML = label;
                } else if (value !== "") {
                    optionEl.innerHTML = value;
                }
                this.append(optionEl);
            }
        }
    }

}

DataGridCell.registerCellType("image", DataGridCellImage);
customElements.define("emc-grid-datagrid-cell-image", DataGridCellImage);
