import ModalDialog from "../ModalDialog.js";
import "../../form/button/Button.js";
import TPL from "./ModalDialogRelationSelect.js.html" assert {type: "html"};
import STYLE from "./ModalDialogRelationSelect.js.css" assert {type: "css"};

export default class ModalDialogRelationSelect extends ModalDialog {

    #inputEl;

    constructor() {
        super("Select entity");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");

        this.#inputEl = els.getElementById("input");
        contentEl.append(this.#inputEl);

        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());
        footerEl.append(cancelEl);

        const submitEl = els.getElementById("submit");
        submitEl.addEventListener("click", () => this.submit());
        footerEl.append(submitEl);
    }

    async show(value) {
        this.#inputEl.value = value;
        const result = await super.show();
        return result && this.#inputEl.value;
    }

    set types(value) {
        this.#inputEl.types = value;
    }

    get types() {
        return this.#inputEl.types;
    }

}

customElements.define("emc-modal-dialog-select-relation", ModalDialogRelationSelect);
