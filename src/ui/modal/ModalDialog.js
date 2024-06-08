import Modal from "./Modal.js";
import "../form/button/Button.js";
import TPL from "./ModalDialog.js.html" assert {type: "html"};
import STYLE from "./ModalDialog.js.css" assert {type: "css"};

const DEFAULT_DIALOG_ICONS = {
    alert: {
        method: "font",
        content: "!",
        style: {
            color: "var(--modal-icon-alert-color, #e98e2d)",
            circle: "var(--modal-icon-alert-color, #e98e2d)"
        }
    },
    confirm: {
        method: "font",
        content: "?",
        style: {
            color: "var(--modal-icon-confirm-color, #0000ff)",
            circle: "var(--modal-icon-confirm-color, #0000ff)"
        }
    },
    promt: {
        method: "font",
        content: "🖉",
        style: {
            size: "1.4em",
            color: "var(--modal-icon-prompt-color, #01ada4)",
            circle: "var(--modal-icon-prompt-color, #01ada4)"
        }
    },
    error: {
        method: "font",
        content: "⚠",
        style: {
            size: "2em",
            color: "var(--modal-icon-error-color, #c50000)"
        }
    }
};

export default class ModalDialog extends Modal {

    static #dialogIcons = new Map();

    #onsubmit = null;

    #oncancel = null;

    #onclose = null;

    #textEl;

    #cancelEl;

    #submitEl;

    #initialFocusElement = null;

    constructor(options = {}) {
        super(options.caption);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");

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
            footerEl.append(this.#cancelEl);
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
            footerEl.append(this.#submitEl);
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

    getSubmitValue() {
        return true;
    }

    static setDialogIcon(type, config) {
        this.#dialogIcons.set(type, config);
    }

    static #applyDialogIcon(dialogEl, type) {
        if (this.#dialogIcons.has(type)) {
            const iconConfig = this.#dialogIcons.get(type);
            if (dialogEl.setIcon(iconConfig)) {
                return;
            }
        }
        dialogEl.setIcon(DEFAULT_DIALOG_ICONS[type]);
    }

    static async alert(caption, text) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: "ok"
        });
        this.#applyDialogIcon(dialogEl, "alert");
        dialogEl.initialFocusElement = dialogEl.#submitEl;
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static async confirm(caption, text) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: "yes",
            cancel: "no"
        });
        this.#applyDialogIcon(dialogEl, "alert");
        dialogEl.initialFocusElement = dialogEl.#cancelEl;
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static async prompt(caption, text, value) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: true,
            cancel: true
        });
        this.#applyDialogIcon(dialogEl, "promt");
        // ---
        const inputEl = document.createElement("input");
        inputEl.className = "prompt-input";
        if (typeof value === "string") {
            inputEl.value = value;
        } else if (typeof value === "number") {
            inputEl.value = value.toString();
        }
        inputEl.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                dialogEl.submit();
            }
            event.stopPropagation();
        });
        dialogEl.append(inputEl);
        dialogEl.initialFocusElement = inputEl;
        // ---
        const result = await dialogEl.show();
        return result && inputEl.value;
    }

    static async promptNumber(caption, text, value = 0, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: true,
            cancel: true
        });
        this.#applyDialogIcon(dialogEl, "promt");
        // ---
        const inputEl = document.createElement("input");
        inputEl.type = "number";
        inputEl.min = min;
        inputEl.max = max;
        inputEl.className = "prompt-input";
        if (typeof value === "number" && !isNaN(value)) {
            inputEl.value = value;
        }
        inputEl.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                dialogEl.submit();
            }
            event.stopPropagation();
        });
        dialogEl.append(inputEl);
        dialogEl.initialFocusElement = inputEl;
        // ---
        const result = await dialogEl.show();
        return result && parseFloat(inputEl.value);
    }

    static async error(caption = "Error", text = "An error occured", errors = []) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: "ok"
        });
        this.#applyDialogIcon(dialogEl, "error");
        // ---
        if (errors.length > 0) {
            const inputEl = document.createElement("textarea");
            inputEl.style.width = "100%";
            inputEl.style.maxHeight = "300px";
            inputEl.style.padding = "5px";
            inputEl.style.color = "black";
            inputEl.style.backgroundColor = "white";
            inputEl.style.border = "solid 1px black";
            inputEl.style.overflow = "auto";
            inputEl.style.whiteSpace = "pre";
            inputEl.style.resize = "none";
            inputEl.readOnly = true;
            inputEl.value = Array.isArray(errors) ? errors.join("\n") : errors.toString();
            dialogEl.append(inputEl);
            dialogEl.initialFocusElement = inputEl;
        }
        // ---
        const result = await dialogEl.show();
        return result;
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

}

customElements.define("emc-modal-dialog", ModalDialog);
