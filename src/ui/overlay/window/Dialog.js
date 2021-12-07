import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import WindowLayer from "./WindowLayer.js";
import Window from "./Window.js";

const TPL = new Template(`
<div id="text">
    [text]
</div>
<div id="footer">
    <button id="submit" title="submit">
        submit
    </button>
    <button id="cancel" title="cancel">
        cancel
    </button>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    position: relative;
    box-sizing: border-box;
}
:host {
    z-index: 900900;
    pointer-events: all;
}
#footer,
#submit,
#cancel {
    display: flex;
}
#text {
    display: block;
    margin: 8px 0px;
    word-wrap: break-word;
    white-space: pre-wrap;
    resize: none;
}
#footer {
    height: 50px;
    margin-top: 20px;
    padding: 10px 30px 10px;
    justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
#submit,
#cancel {
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    padding: 5px;
    border: solid 1px black;
    border-radius: 2px;
    text-transform: uppercase;
    cursor: pointer;
    user-select: none;
    -webkit-appearance: none;
}
#submit:hover,
#cancel:hover {
    color: white;
    background-color: black;
}
#window {
    width: auto;
    min-width: 20vw;
}
`);

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
            }
            dialogEl.oncancel = function() {
                resolve(false);
            }
            dialogEl.onclose = function() {
                resolve();
            }
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
            }
            dialogEl.oncancel = function() {
                resolve(false);
            }
            dialogEl.onclose = function() {
                resolve();
            }
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
            if (typeof def == "string") {
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
                resolve(inputEl.value);
            }
            dialogEl.oncancel = function() {
                resolve(false);
            }
            dialogEl.onclose = function() {
                resolve();
            }
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
            inputEl.style.maxWidth = "100%";
            inputEl.style.maxHeight = "300px";
            inputEl.style.padding = "5px";
            inputEl.style.color = "black";
            inputEl.style.backgroundColor = "white";
            inputEl.style.border = "solid 1px black";
            inputEl.style.overflow = "scroll";
            inputEl.style.whiteSpace = "pre";
            inputEl.readOnly = true;
            inputEl.value = Array.isArray(errors) ? errors.join("\n") : errors.toString();
            dialogEl.append(inputEl);
            // ---
            dialogEl.onsubmit = function() {
                resolve(true);
            }
            dialogEl.oncancel = function() {
                resolve(false);
            }
            dialogEl.onclose = function() {
                resolve();
            }
            dialogEl.show();
        });
    }

}

customElements.define("emc-dialog", Dialog);
