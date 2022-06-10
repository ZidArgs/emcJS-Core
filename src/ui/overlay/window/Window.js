import CustomElement from "../../element/CustomElement.js";
import WindowLayer from "./WindowLayer.js";
import I18nLabel from "../../i18n/I18nLabel.js";
import "../../symbols/CloseSymbol.js";
import TPL from "./Window.html" assert {type: "html"};
import STYLE from "./Window.css" assert {type: "css"};

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
