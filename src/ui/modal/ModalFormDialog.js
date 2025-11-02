import Modal from "./Modal.js";
import "../form/button/Button.js";
import TPL from "./ModalFormDialog.js.html" assert {type: "html"};
import STYLE from "./ModalFormDialog.js.css" assert {type: "css"};
import FormContext from "../../util/form/FormContext.js";
import FormBuilder from "../../util/form/FormBuilder.js";

export default class ModalFormDialog extends Modal {

    #onsubmit = null;

    #oncancel = null;

    #onclose = null;

    #contentEl;

    #textEl;

    #footerEl;

    #formContainerEl;

    #formEl;

    #cancelEl;

    #submitEl;

    #initialFocusElement = null;

    #formContext = new FormContext();

    constructor(options = {}) {
        super(options.caption);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#footerEl = this.shadowRoot.getElementById("footer");
        this.#formContainerEl = els.getElementById("form-container");
        this.#formContext.registerFormContainer(this.#formContainerEl);
        this.#contentEl.append(this.#formContainerEl);
        this.#formEl = this.shadowRoot.getElementById("form");

        if (!!options.text && typeof options.text === "string") {
            this.#textEl = this.shadowRoot.getElementById("text");
            if (options.text instanceof HTMLElement) {
                this.#textEl.append(options.text);
            } else if (typeof options.text === "string") {
                this.#textEl.innerHTML = options.text;
            }
        }

        if (options.cancel) {
            this.#cancelEl = els.getElementById("cancel");
            if (options.cancel instanceof HTMLElement) {
                this.#cancelEl.text = undefined;
                this.#cancelEl.append(options.cancel);
            } else if (typeof options.cancel === "string") {
                this.#cancelEl.text = options.cancel;
            }
            this.#cancelEl.addEventListener("click", () => this.cancel());
            this.#footerEl.append(this.#cancelEl);
        }

        if (options.submit) {
            this.#submitEl = els.getElementById("submit");
            if (options.submit instanceof HTMLElement) {
                this.#submitEl.text = undefined;
                this.#submitEl.append(options.submit);
            } else if (typeof options.submit === "string") {
                this.#submitEl.text = options.submit;
            }
            this.#submitEl.addEventListener("click", () => this.submit());
            this.#footerEl.append(this.#submitEl);
        }
    }

    async show() {
        return new Promise((resolve) => {
            this.#onsubmit = function() {
                resolve(true);
            };
            this.#oncancel = function() {
                resolve(false);
            };
            this.#onclose = function() {
                resolve();
            };
            super.show();
        });
    }

    submit() {
        this.remove();
        if (this.#onsubmit) {
            this.#onsubmit();
            this.#onsubmit = null;
            this.#oncancel = null;
            this.#onclose = null;
        }
        this.dispatchEvent(new Event("submit"));
    }

    cancel() {
        this.remove();
        if (this.#oncancel) {
            this.#oncancel();
            this.#onsubmit = null;
            this.#oncancel = null;
            this.#onclose = null;
        }
        this.dispatchEvent(new Event("cancel"));
    }

    close() {
        this.remove();
        if (this.#onclose) {
            this.#onclose();
            this.#onsubmit = null;
            this.#oncancel = null;
            this.#onclose = null;
        }
        this.dispatchEvent(new Event("close"));
    }

    initialFocus() {
        const presetEl = this.initialFocusElement;
        if (presetEl != null) {
            presetEl.focus();
        } else {
            super.initialFocus();
        }
    }

    set initialFocusElement(value) {
        if (value instanceof HTMLElement) {
            this.#initialFocusElement = value;
        } else {
            this.#initialFocusElement = null;
        }
    }

    get initialFocusElement() {
        return this.#initialFocusElement;
    }

    loadFormConfig(config) {
        FormBuilder.replaceForm(this.#formEl, config);
    }

}

customElements.define("emc-modal-form-dialog", ModalFormDialog);
