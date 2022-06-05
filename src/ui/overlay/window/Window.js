import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import CustomElement from "../../CustomElement.js";
import WindowLayer from "./WindowLayer.js";
import I18nLabel from "../../i18n/I18nLabel.js";
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
:host {
    position: fixed;
    align-items: flex-start;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}
:host(.inactive) {
    filter: blur(2px);
    pointer-events: none;
}
:host,
.footer,
.button {
    display: flex;
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

export default class Window extends CustomElement {

    constructor(title = "", close = "close") {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("keypress", (event) => {
            if (event.key == "Escape") {
                this.close();
            }
            event.stopPropagation();
        });
        const titleEl = this.shadowRoot.getElementById("title");
        titleEl.append(I18nLabel.getLabel(title));
        const closeEl = this.shadowRoot.getElementById("close");
        if (!!close && typeof close === "string") {
            closeEl.setAttribute("title", close);
        }
        closeEl.addEventListener("click", () => this.close());
        /* --- */
        const focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        focusTopEl.addEventListener("focus", () => {
            this.focusLast();
        });
        const focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        focusBottomEl.addEventListener("focus", () => {
            this.focusFirst();
        });
    }

    disconnectedCallback() {
        this.classList.remove("inactive");
    }

    show() {
        WindowLayer.append(this);
        this.initialFocus();
    }

    close() {
        this.remove();
        this.dispatchEvent(new Event("close"));
    }

    #getAllFocusable() {
        const els = Array.from(this.shadowRoot.querySelectorAll(Q_TAB));
        return els.slice(1, -1);
    }

    #getBodyFocusable() {
        return Array.from(this.querySelectorAll(Q_TAB));
    }

    initialFocus() {
        const bodyEls = this.#getBodyFocusable();
        if (bodyEls.length) {
            bodyEls[0].focus();
        } else {
            const windowEls = this.#getAllFocusable();
            if (windowEls.length) {
                windowEls[0].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

    focusFirst() {
        const windowEls = this.#getAllFocusable();
        if (windowEls.length) {
            windowEls[0].focus();
        } else {
            const bodyEls = this.#getBodyFocusable();
            if (bodyEls.length) {
                bodyEls[0].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

    focusLast() {
        const windowEls = this.#getAllFocusable();
        if (windowEls.length) {
            windowEls[windowEls.length - 1].focus();
        } else {
            const bodyEls = this.#getBodyFocusable();
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
