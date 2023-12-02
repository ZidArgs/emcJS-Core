import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import ModalDialog from "../../../modal/ModalDialog.js";
import "../../../grid/DataGrid.js";
import TPL from "./KeyValueListInput.js.html" assert {type: "html"};
import STYLE from "./KeyValueListInput.js.css" assert {type: "css"};
import {
    debounce
} from "../../../../util/Debouncer.js";

/** visualization:
 * +--------------------------------------------------+
 * | Search...                                        | <-- filter list by key and value; always show empty keys / values
 * +--------------------------------------------------+
 * | +--------------------+-------------------+-----+ |
 * | | key 1              | value 1           | DEL | | <-- string input for "key" & "value"; keys must be unique; key edit optional -> key readonly
 * | +--------------------+-------------------+-----+ |
 * | | key 2              | value 2           | DEL | | <-- DEL is optional (one option for "DEL" and "Add new" -> list readonly)
 * | +--------------------+-------------------+-----+ |
 * | |                    |                   | DEL | | <-- initial "key" & "value" is ""
 * | +--------------------+-------------------+-----+ |
 * +--------------------------------------------------+
 * | +---------+                                      |
 * | | Add new |                                      | <-- optional; on add scroll to new entry and focus new "key" input; use dialog if keys not editable
 * | +---------+                                      |
 * +--------------------------------------------------+
 */

/** target value output:
 * {
 *     [string=key]: [string=value]
 * }
 */

/** readonly option: (search never readonly)
 * - false [default] -> no readonly
 * - key -> keys can not be edited
 * - list -> deactivate add & delete; keys can not be edited
 * - true -> deactivate add & delete; keys & values can not be edited
 */

// TODO make values editable
// TODO add readonly mode

export default class KeyValueListInput extends CustomFormElementDelegating {

    #value;

    #searchEl;

    #gridEl;

    #addEl;

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
            const currentValue = {...this.#value};
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
            currentValue[rowName] = "";
            this.value = currentValue;
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
        this.#gridEl.addEventListener("editValue", debounce((event) => {
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
        this.#searchEl.addEventListener("change", () => {

        }, true);
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#value = value;
        this.#applyValue(value);
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
            this.#applyValue(value);
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
                    if (this.#value === undefined) {
                        this.#applyValue(this.value);
                        this.internals.setFormValue(this.value);
                        /* --- */
                        this.dispatchEvent(new Event("change"));
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

    #applyValue() {
        const data = Object.entries(this.#value ?? {}).map((row) => {
            return {
                name: row[0],
                value: row[1]
            }
        });
        this.#gridEl.setData(data);
    }

    checkValid() {
        // TODO validate unique key
        return super.checkValid();
    }

}

customElements.define("emc-input-key-value-list", KeyValueListInput);
