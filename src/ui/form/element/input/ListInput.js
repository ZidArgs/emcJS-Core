import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import {
    isEqual
} from "../../../../util/helper/Comparator.js";
import ModalDialog from "../../../modal/ModalDialog.js";
import "../../../grid/DataGrid.js";
import TPL from "./ListInput.js.html" assert {type: "html"};
import STYLE from "./ListInput.js.css" assert {type: "css"};

export default class ListInput extends CustomFormElementDelegating {

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
            let key = null;
            const value = this.value ?? [];
            while (key == null) {
                key = await ModalDialog.prompt("Add item", "Please enter a new key");
                if (typeof key !== "string") {
                    return;
                }
                if (value.includes(key)) {
                    await ModalDialog.alert("Key already exists", `The key "${key}" does already exist. Please enter another one!`);
                    key = null;
                }
            }
            this.value = [...value, key];
        });
        this.#gridEl.registerCustomAction("delete", (buttonEl, name, data) => {
            this.value = this.value.filter((key) => key === data["key"]);
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
        const data = (this.#value ?? []).map((row) => {
            return {
                key: row
            }
        });
        this.#gridEl.setData(data);
    }

    checkValid() {
        // TODO validate unique key
        return super.checkValid();
    }

}

customElements.define("emc-input-list", ListInput);
