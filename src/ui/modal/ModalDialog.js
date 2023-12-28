import ModalLayer from "./ModalLayer.js";
import Modal from "./Modal.js";
import "../form/button/Button.js";
import TPL from "./ModalDialog.js.html" assert {type: "html"};
import STYLE from "./ModalDialog.js.css" assert {type: "css"};

export default class ModalDialog extends Modal {

    #onsubmit = null;

    #oncancel = null;

    #onclose = null;

    constructor(options = {}) {
        super(options.title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");

        if (!!options.text && typeof options.text === "string") {
            const textEl = this.shadowRoot.getElementById("text");
            if (options.text instanceof HTMLElement) {
                textEl.append(options.text);
            } else if (typeof options.text === "string") {
                textEl.innerHTML = options.text;
            }
        }

        if (options.cancel) {
            const cancelEl = els.getElementById("cancel");
            if (options.cancel instanceof HTMLElement) {
                cancelEl.text = undefined;
                cancelEl.append(options.cancel);
            } else if (typeof options.cancel === "string") {
                cancelEl.text = options.cancel;
            }
            cancelEl.addEventListener("click", () => this.cancel());
            footerEl.append(cancelEl);
        }

        if (options.submit) {
            const submitEl = els.getElementById("submit");
            if (options.submit instanceof HTMLElement) {
                submitEl.text = undefined;
                submitEl.append(options.submit);
            } else if (typeof options.submit === "string") {
                submitEl.text = options.submit;
            }
            submitEl.addEventListener("click", () => this.submit());
            footerEl.append(submitEl);
        }
    }

    async show() {
        return new Promise((resolve) => {
            this.#onsubmit = function() {
                resolve(true);
            }
            this.#oncancel = function() {
                resolve(false);
            }
            this.#onclose = function() {
                resolve();
            }
            ModalLayer.append(this, "dialog");
            this.initialFocus();
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

    getSubmitValue() {
        return true;
    }

    static async alert(ttl, msg) {
        const dialogEl = new ModalDialog({
            title: ttl,
            text: msg,
            submit: "ok"
        });
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static async confirm(ttl, msg) {
        const dialogEl = new ModalDialog({
            title: ttl,
            text: msg,
            submit: "yes",
            cancel: "no"
        });
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static async prompt(ttl, msg, value) {
        const dialogEl = new ModalDialog({
            title: ttl,
            text: msg,
            submit: true,
            cancel: true
        });
        // ---
        const inputEl = document.createElement("input");
        inputEl.style.padding = "5px";
        inputEl.style.color = "black";
        inputEl.style.backgroundColor = "white";
        inputEl.style.border = "solid 1px black";
        if (typeof value === "string") {
            inputEl.value = value;
        }
        inputEl.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                dialogEl.submit();
            }
            event.stopPropagation();
        });
        dialogEl.append(inputEl);
        // ---
        const result = await dialogEl.show();
        return result && inputEl.value;
    }

    static async error(ttl = "Error", msg = "An error occured", errors = []) {
        const dialogEl = new ModalDialog({
            title: ttl,
            text: msg,
            submit: "ok"
        });
        // ---
        const inputEl = document.createElement("textarea");
        inputEl.style.width = "700px";
        inputEl.style.maxWidth = "80vw";
        inputEl.style.height = "300px";
        inputEl.style.padding = "5px";
        inputEl.style.color = "black";
        inputEl.style.backgroundColor = "white";
        inputEl.style.border = "solid 1px black";
        inputEl.style.overflow = "scroll";
        inputEl.style.whiteSpace = "pre";
        inputEl.style.resize = "none";
        inputEl.readOnly = true;
        inputEl.value = Array.isArray(errors) ? errors.join("\n") : errors.toString();
        dialogEl.append(inputEl);
        // ---
        const result = await dialogEl.show();
        return result;
    }

}

customElements.define("emc-modal-dialog", ModalDialog);
