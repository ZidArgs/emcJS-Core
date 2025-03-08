import Window from "./Window.js";
import TPL from "./Dialog.js.html" assert {type: "html"};
import STYLE from "./Dialog.js.css" assert {type: "css"};

// TODO all dialogs should have their own class extending the Dialog class

export default class Dialog extends Window {

    #windowEl;

    #textEl;

    #footerEl;

    #submitEl;

    #cancelEl;

    constructor(options = {}) {
        super(options.title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#windowEl = this.shadowRoot.getElementById("window");
        this.#footerEl = els.getElementById("footer");
        this.#windowEl.append(this.#footerEl);

        if (!!options.text && typeof options.text === "string") {
            this.#textEl = els.getElementById("text");
            this.shadowRoot.getElementById("body").insertBefore(this.#textEl, this.shadowRoot.getElementById("body").children[0]);
            if (options.text instanceof HTMLElement) {
                this.#textEl.append(options.text);
            } else if (typeof options.text === "string") {
                this.#textEl.innerHTML = options.text;
            }
        }

        this.#submitEl = this.shadowRoot.getElementById("submit");
        if (options.submit) {
            if (options.submit instanceof HTMLElement) {
                this.#submitEl.innerHTML = "";
                this.#submitEl.append(options.submit);
            } else if (typeof options.submit === "string") {
                this.#submitEl.innerHTML = options.submit;
            }
            this.#submitEl.addEventListener("click", () => this.submit());
        } else {
            this.#submitEl.remove();
        }

        this.#cancelEl = this.shadowRoot.getElementById("cancel");
        if (options.cancel) {
            if (options.cancel instanceof HTMLElement) {
                this.#cancelEl.innerHTML = "";
                this.#cancelEl.append(options.cancel);
            } else if (typeof options.cancel === "string") {
                this.#cancelEl.innerHTML = options.cancel;
            }
            this.#cancelEl.addEventListener("click", () => this.cancel());
        } else {
            this.#cancelEl.remove();
        }
    }

    submit() {
        this.dispatchEvent(new Event("submit"));
        this.remove();
    }

    cancel() {
        this.dispatchEvent(new Event("cancel"));
        this.remove();
    }

    static alert(ttl, msg) {
        return new Promise(function(resolve) {
            const dialogEl = new Dialog({
                title: ttl,
                text: msg,
                submit: "ok"
            });
            // ---
            dialogEl.onsubmit = function() {
                resolve(true);
            };
            dialogEl.oncancel = function() {
                resolve(false);
            };
            dialogEl.onclose = function() {
                resolve();
            };
            dialogEl.show();
        });
    }

    static confirm(ttl, msg) {
        return new Promise(function(resolve) {
            const dialogEl = new Dialog({
                title: ttl,
                text: msg,
                submit: "yes",
                cancel: "no"
            });
            // ---
            dialogEl.onsubmit = function() {
                resolve(true);
            };
            dialogEl.oncancel = function() {
                resolve(false);
            };
            dialogEl.onclose = function() {
                resolve();
            };
            dialogEl.show();
        });
    }

    static prompt(ttl, msg, def) {
        return new Promise(function(resolve) {
            const dialogEl = new Dialog({
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
            if (typeof def === "string") {
                inputEl.value = def;
            } else if (typeof def === "number") {
                inputEl.value = def.toString();
            }
            inputEl.addEventListener("keypress", (event) => {
                if (event.key == "Enter") {
                    dialogEl.submit();
                }
                event.stopPropagation();
            });
            dialogEl.append(inputEl);
            // ---
            dialogEl.onsubmit = function() {
                resolve(inputEl.value);
            };
            dialogEl.oncancel = function() {
                resolve(false);
            };
            dialogEl.onclose = function() {
                resolve();
            };
            dialogEl.show();
        });
    }

    static promptNumber(ttl, msg, def, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        return new Promise(function(resolve) {
            const dialogEl = new Dialog({
                title: ttl,
                text: msg,
                submit: true,
                cancel: true
            });
            // ---
            const inputEl = document.createElement("input");
            inputEl.type = "number";
            inputEl.min = min;
            inputEl.max = max;
            inputEl.style.padding = "5px";
            inputEl.style.color = "black";
            inputEl.style.backgroundColor = "white";
            inputEl.style.border = "solid 1px black";
            inputEl.style.textAlign = "end";
            if (typeof def === "number" && !isNaN(def)) {
                inputEl.value = def;
            }
            inputEl.addEventListener("keypress", (event) => {
                if (event.key == "Enter") {
                    dialogEl.submit();
                }
                event.stopPropagation();
            });
            dialogEl.append(inputEl);
            // ---
            dialogEl.onsubmit = function() {
                resolve(parseFloat(inputEl.value));
            };
            dialogEl.oncancel = function() {
                resolve(false);
            };
            dialogEl.onclose = function() {
                resolve();
            };
            dialogEl.show();
        });
    }

    static error(ttl = "Error", msg = "An error occured", errors = []) {
        return new Promise(function(resolve) {
            const dialogEl = new Dialog({
                title: ttl,
                text: msg,
                submit: "ok"
            });
            // ---
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
            // ---
            dialogEl.onsubmit = function() {
                resolve(true);
            };
            dialogEl.oncancel = function() {
                resolve(false);
            };
            dialogEl.onclose = function() {
                resolve();
            };
            dialogEl.show();
        });
    }

}

customElements.define("emc-dialog", Dialog);
