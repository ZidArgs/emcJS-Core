import Modal from "../../../../../modal/Modal.js";
import {
    debounce
} from "../../../../../../util/Debouncer.js";
import LogicValidator from "../../../../../../util/logic/LogicValidator.js";
import Logger from "../../../../../../util/log/Logger.js";
import "../../../../button/Button.js";
import TPL from "./LogicJSONModal.js.html" assert {type: "html"};
import STYLE from "./LogicJSONModal.js.css" assert {type: "css"};

// TODO use ModalDialog instead
export default class LogicJSONModal extends Modal {

    #submitEl;

    #jsonEl;

    #errorEl;

    constructor() {
        super("Edit JSON...");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.innerHTML = "";
        this.#jsonEl = els.getElementById("json");
        this.#errorEl = els.getElementById("error");
        contentEl.append(this.#jsonEl);
        contentEl.append(this.#errorEl);
        /* --- */
        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => {
            this.close();
        });
        footerEl.append(cancelEl);
        /* --- */
        this.#submitEl = els.getElementById("submit");
        this.#submitEl.addEventListener("click", () => {
            if (this.#jsonEl.validationMessage === "") {
                const errors = LogicValidator.validate(this.value);
                if (errors.length > 0) {
                    this.#jsonEl.setCustomValidity("Invalid Logic");
                    this.#errorEl.i18nContent = "Invalid Logic";
                    Logger.error(`Invalid Logic\n${errors.map((s) => `\t${s}`).join("\n")}`);
                } else {
                    this.dispatchEvent(new Event("submit"));
                    this.close();
                }
            }
        });
        footerEl.append(this.#submitEl);
        /* --- */
        this.#jsonEl.addEventListener("input", () => {
            this.#validateInput();
        });
    }

    #validateInput = debounce(() => {
        try {
            JSON.parse(this.#jsonEl.value);
            this.#jsonEl.setCustomValidity("");
            this.#errorEl.i18nContent = "";
            this.#submitEl.disabled = false;
        } catch {
            this.#jsonEl.setCustomValidity("Invalid JSON");
            this.#errorEl.i18nContent = "Invalid JSON";
            this.#submitEl.disabled = true;
        }
    });

    set value(value) {
        this.#jsonEl.value = value != null ? JSON.stringify(value, null, 4) : "";
    }

    get value() {
        return JSON.parse(this.#jsonEl.value);
    }

}

customElements.define("emc-edit-logic-modal-json", LogicJSONModal);
