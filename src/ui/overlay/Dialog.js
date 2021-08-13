import Window from "./Window.js";
import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

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
* {
    position: relative;
    box-sizing: border-box;
}
#footer,
#submit,
#cancel {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
#text {
    display: block;
    margin: 8px 0px;
    word-wrap: break-word;
    resize: none;
}
#footer {
    height: 50px;
    margin-top: 20px;
    padding: 10px 30px 10px;
    -webkit-box-pack: end;
        -ms-flex-pack: end;
            justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
#submit,
#cancel {
    margin-left: 10px;
    padding: 5px;
    border: solid 1px black;
    border-radius: 2px;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    cursor: pointer;
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

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

export default class Dialog extends Window {

    constructor(options = {}) {
        super(options.title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const window = this.shadowRoot.getElementById("window");
        const footer = els.getElementById("footer");
        window.append(footer);

        if (!!options.text && typeof options.text === "string") {
            const text = els.getElementById("text");
            this.shadowRoot.getElementById("body").insertBefore(text, this.shadowRoot.getElementById("body").children[0]);
            if (options.text instanceof HTMLElement) {
                text.append(options.text);
            } else if (typeof options.text === "string") {
                text.innerHTML = options.text;
            }
        }

        const sbm = this.shadowRoot.getElementById("submit");
        if (options.submit) {
            if (options.submit instanceof HTMLElement) {
                sbm.innerHTML = "";
                sbm.append(options.submit);
            } else if (typeof options.submit === "string") {
                sbm.innerHTML = options.submit;
            }
            sbm.onclick = () => {
                this.dispatchEvent(new Event("submit"));
                this.remove();
            };
        } else {
            sbm.remove();
        }

        const ccl = this.shadowRoot.getElementById("cancel");
        if (options.cancel) {
            if (options.cancel instanceof HTMLElement) {
                ccl.innerHTML = "";
                ccl.append(options.cancel);
            } else if (typeof options.cancel === "string") {
                ccl.innerHTML = options.cancel;
            }
            ccl.onclick = () => {
                this.dispatchEvent(new Event("cancel"));
                this.remove();
            };
        } else {
            ccl.remove();
        }
    }

    initialFocus() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.push(this.shadowRoot.getElementById("close"));
        a[0].focus();
    }

    focusFirst() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.unshift(this.shadowRoot.getElementById("close"));
        a[0].focus();
    }
    
    focusLast() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.unshift(this.shadowRoot.getElementById("close"));
        a[a.length - 1].focus();
    }
    
    static alert(ttl, msg) {
        return new Promise(function(resolve) {
            const d = new Dialog({
                title: ttl,
                text: msg,
                submit: "OK"
            });
            d.onsubmit = function() {
                resolve(true);
            }
            d.oncancel = function() {
                resolve(false);
            }
            d.onclose = function() {
                resolve();
            }
            d.show();
        });
    }
    
    static confirm(ttl, msg) {
        return new Promise(function(resolve) {
            const d = new Dialog({
                title: ttl,
                text: msg,
                submit: "YES",
                cancel: "NO"
            });
            d.onsubmit = function() {
                resolve(true);
            }
            d.oncancel = function() {
                resolve(false);
            }
            d.onclose = function() {
                resolve();
            }
            d.show();
        });
    }
    
    static prompt(ttl, msg, def) {
        return new Promise(function(resolve) {
            const d = new Dialog({
                title: ttl,
                text: msg,
                submit: "YES",
                cancel: "NO"
            });
            const el = document.createElement("input");
            el.style.padding = "5px";
            el.style.backgroundColor = "white";
            el.style.border = "solid 1px black";
            el.style.color = "black";
            if (typeof def == "string") {
                el.value = def;
            }
            d.append(el);
            d.onsubmit = function() {
                resolve(el.value);
            }
            d.oncancel = function() {
                resolve(false);
            }
            d.onclose = function() {
                resolve();
            }
            d.show();
        });
    }

}

customElements.define("emc-dialog", Dialog);
