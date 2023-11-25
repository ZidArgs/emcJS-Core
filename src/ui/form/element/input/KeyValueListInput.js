import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import "../../../grid/DataGrid.js";
import TPL from "./KeyValueListInput.js.html" assert {type: "html"};
import STYLE from "./KeyValueListInput.js.css" assert {type: "css"};
import ModalDialog from "../../../modal/ModalDialog.js";

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

    #gridEl;

    #value;

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
        this.#gridEl = this.shadowRoot.getElementById("grid");
        const addEl = this.shadowRoot.getElementById("add");
        addEl.addEventListener("click", async () => {
            console.log("add item");
            let key = null;
            const value = this.value ?? {};
            while (key == null) {
                key = await ModalDialog.prompt("Add item", "Please enter a new key");
                if (typeof key !== "string") {
                    return;
                }
                if (key in value) {
                    await ModalDialog.alert("Key already exists", `The key "${key}" does already exist. Please enter another one!`);
                    key = null;
                }
            }
            this.value = {...value, [key]: ""};
        });
        this.#gridEl.registerCustomAction("delete", (buttonEl, name, data) => {
            const value = {...this.value};
            const key = data["key"];
            if (key in value) {
                delete value[key];
            }
            this.value = value;
        });
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
        // TODO disable all inputs and buttons
        // this.#inputEl.disabled = disabled;
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
                key: row[0],
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
