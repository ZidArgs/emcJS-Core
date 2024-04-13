import WindowLayer from "./WindowLayer.js";
import Window from "./Window.js";
import TPL from "./Dialog.js.html" assert {type: "html"};
import STYLE from "./Dialog.js.css" assert {type: "css"};

// TODO all dialogs should have their own class extending the Dialog class

export default class Dialog extends Window {

    constructor(options = {}) {
        super(options.title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const windowEl = this.shadowRoot.getElementById("window");
        const footerEl = els.getElementById("footer");
        windowEl.append(footerEl);

        if (!!options.text && typeof options.text === "string") {
            const textEl = els.getElementById("text");
            this.shadowRoot.getElementById("body").insertBefore(textEl, this.shadowRoot.getElementById("body").children[0]);
            if (options.text instanceof HTMLElement) {
                textEl.append(options.text);
            } else if (typeof options.text === "string") {
                textEl.innerHTML = options.text;
            }
        }

        const submitEl = this.shadowRoot.getElementById("submit");
        if (options.submit) {
            if (options.submit instanceof HTMLElement) {
                submitEl.innerHTML = "";
                submitEl.append(options.submit);
            } else if (typeof options.submit === "string") {
                submitEl.innerHTML = options.submit;
            }
            submitEl.addEventListener("click", () => this.submit());
        } else {
            submitEl.remove();
        }

        const cancelEl = this.shadowRoot.getElementById("cancel");
        if (options.cancel) {
            if (options.cancel instanceof HTMLElement) {
                cancelEl.innerHTML = "";
                cancelEl.append(options.cancel);
            } else if (typeof options.cancel === "string") {
                cancelEl.innerHTML = options.cancel;
            }
            cancelEl.addEventListener("click", () => this.cancel());
        } else {
            cancelEl.remove();
        }
    }

    show() {
        WindowLayer.append(this, "dialogs");
        this.initialFocus();
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
