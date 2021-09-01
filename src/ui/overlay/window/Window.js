import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import WindowLayer from "./WindowLayer.js";
import "../../symbols/CloseSymbol.js";

const TPL = new Template(`
<div id="focus_catcher_top" tabindex="0"></div>
<emc-ctxmenulayer>
    <div id="window" role="dialog" aria-modal="true" aria-labelledby="title" aria-describedby="title">
        <div id="header">
            <div id="title"></div>
            <button id="close" title="close">
                <emc-symbol-close></emc-symbol-close>
            </button>
        </div>
        <div id="body">
            <slot></slot>
        </div>
    </div>
</emc-ctxmenulayer>
<div id="focus_catcher_bottom" tabindex="0"></div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host,
.footer,
.button {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
:host {
    position: fixed !important;
    align-items: flex-start;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}
#window {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1000px;
    margin-top: 100px;
    color: black;
    background-color: white;
    border: solid 2px #cccccc;
    border-radius: 4px;
    resize: both;
    pointer-events: all;
}
#header {
    display: flex;
    border-bottom: solid 2px #cccccc;
}
#title {
    display: flex;
    align-items: center;
    flex: 1;
    height: 30px;
    padding: 0 10px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1em;
    line-height: 1em;
}
#body {
    display: flex;
    flex-direction: column;
    padding: 5px;
    min-height: 10vh;
    max-height: 50vh;
    overflow: auto;
}
:focus {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
}
#close {
    display: flex;
    width: 40px;
    height: 30px;
    border: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
    font-size: 1.2em;
    line-height: 1em;
}
#close:hover {
    color: white;
    background-color: red;
}
#close:focus {
    box-shadow: inset red 0 0px 3px 4px;
    outline: none;
}
#close:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
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

export default class Window extends HTMLElement {

    constructor(title = "", close = "close") {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("keyup", (event) => {
            if (event.key == "Escape") {
                this.close();
            }
            event.stopPropagation();
        });
        const ttl = this.shadowRoot.getElementById("title");
        if (title instanceof HTMLElement) {
            ttl.append(title);
        } else if (typeof title === "string") {
            ttl.innerHTML = title;
        }
        const cls = this.shadowRoot.getElementById("close");
        if (!!close && typeof close === "string") {
            cls.setAttribute("title", close);
        }
        cls.onclick = this.close.bind(this);
        /* --- */
        const focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        focusTopEl.onfocus = this.focusLast.bind(this);
        const focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        focusBottomEl.onfocus = this.focusFirst.bind(this);
    }

    show() {
        WindowLayer.append(this);
        this.initialFocus();
    }

    close() {
        this.remove();
        this.dispatchEvent(new Event("close"));
    }

    initialFocus() {
        const bodyEls = Array.from(this.querySelectorAll(Q_TAB));
        if (bodyEls.length) {
            bodyEls[0].focus();
        } else {
            const windowEls = Array.from(this.shadowRoot.querySelectorAll(Q_TAB));
            if (windowEls.length) {
                windowEls[0].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

    focusFirst() {
        const closeEl = this.shadowRoot.getElementById("close");
        closeEl.focus();
    }
    
    focusLast() {
        const windowEls = Array.from(this.shadowRoot.querySelectorAll(Q_TAB));
        if (windowEls.length) {
            windowEls[windowEls.length - 1].focus();
        } else {
            const bodyEls = Array.from(this.querySelectorAll(Q_TAB));
            if (bodyEls.length) {
                bodyEls[bodyEls.length - 1].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

}

customElements.define("emc-window", Window);
