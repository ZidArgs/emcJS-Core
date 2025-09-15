import Modal from "../../../../../../modal/Modal.js";
import ModalDialog from "../../../../../../modal/ModalDialog.js";
import {debounce} from "../../../../../../../util/Debouncer.js";
import LogicValidator from "../../../../../../../util/logic/LogicValidator.js";
import Logger from "../../../../../../../util/log/Logger.js";
import "../../../code/CodeInput.js";
import "../../../../../button/Button.js";
import TPL from "./LogicJSONModal.js.html" assert {type: "html"};
import STYLE from "./LogicJSONModal.js.css" assert {type: "css"};
import jsonParse from "../../../../../../../patches/JSONParser.js";

// TODO use ModalDialog instead
export default class LogicJSONModal extends Modal {

    #contentEl;

    #footerEl;

    #submitEl;

    #cancelEl;

    #jsonEl;

    constructor() {
        super("Logic - JSON-Representation");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#footerEl = this.shadowRoot.getElementById("footer");
        this.#contentEl.innerHTML = "";
        this.#jsonEl = els.getElementById("json");
        this.#contentEl.append(this.#jsonEl);
        /* --- */
        this.#cancelEl = els.getElementById("cancel");
        this.#cancelEl.addEventListener("click", () => {
            this.close();
        });
        this.#footerEl.append(this.#cancelEl);
        /* --- */
        this.#submitEl = els.getElementById("submit");
        this.#submitEl.addEventListener("click", () => {
            if (this.#jsonEl.validationMessage === "") {
                const errors = LogicValidator.validate(this.value);
                if (errors.length > 0) {
                    ModalDialog.error("Invalid Logic", null, errors);
                    Logger.error(`Invalid Logic\n${errors.map((s) => `\t${s}`).join("\n")}`);
                } else {
                    this.dispatchEvent(new Event("submit"));
                    this.close();
                }
            }
        });
        this.#footerEl.append(this.#submitEl);
        /* --- */
        this.#jsonEl.addEventListener("input", () => {
            this.#validateInput();
        });
    }

    show(readonly = false) {
        if (readonly) {
            this.#jsonEl.readonly = true;
            this.#cancelEl.style.display = "none";
            this.#submitEl.style.display = "none";
        } else {
            this.#jsonEl.readonly = false;
            this.#cancelEl.style.display = "";
            this.#submitEl.style.display = "";
        }
        super.show();
    }

    #validateInput = debounce(() => {
        try {
            jsonParse(this.#jsonEl.value);
            this.#jsonEl.setCustomValidity("");
            this.#submitEl.disabled = false;
        } catch {
            this.#jsonEl.setCustomValidity("Invalid JSON");
            this.#submitEl.disabled = true;
        }
    });

    set value(value) {
        this.#jsonEl.value = value != null ? JSON.stringify(value, null, 4) : "";
    }

    get value() {
        return jsonParse(this.#jsonEl.value);
    }

}

customElements.define("emc-edit-logic-modal-json", LogicJSONModal);
