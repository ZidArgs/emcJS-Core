import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import ElementListCache from "../../../../util/html/ElementListCache.js";
import TPL from "./KeyValueListInput.js.html" assert {type: "html"};
import STYLE from "./KeyValueListInput.js.css" assert {type: "css"};

/** visualization:
 * +--------------------------------------------------+
 * | Search...                                        | <-- filter list by key and value; always show empty
 * +--------------------------------------------------+
 * | +--------------------+-------------------+-----+ |
 * | | Key 1              | value 1           | DEL | | <-- string input for "key" & "value"; keys must be unique; key edit optional -> key readonly
 * | +--------------------+-------------------+-----+ |
 * | | Key 2              | value 2           | DEL | | <-- DEL is optional (one option for "DEL" and "Add new" -> list readonly)
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

export default class KeyValueListInput extends CustomFormElementDelegating {

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
        if (this.#value != value) {
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
                    // TODO build internal structure
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
        // TODO build internal structure
    }

    checkValid() {
        // TODO validate unique key
        return super.checkValid();
    }

}

customElements.define("emc-input-keyvaluelist", KeyValueListInput);
