import CustomElement from "../element/CustomElement.js";
import "../i18n/I18nLabel.js";
import "../symbols/CloseSymbol.js";
import TPL from "./Modal.js.html" assert {type: "html"};
import STYLE from "./Modal.js.css" assert {type: "css"};

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

const visibleModals = new Set();

export default class Modal extends CustomElement {

    #titleTextEl;

    constructor(title = "", close = "close") {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#titleTextEl = this.shadowRoot.getElementById("title-text");
        this.#titleTextEl.i18nValue = title;
        /* --- */
        this.addEventListener("keypress", (event) => {
            if (event.key == "Escape") {
                this.close();
            }
            event.stopPropagation();
        });
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

    setTitle(value) {
        this.#titleTextEl.i18nValue = value;
    }

    show() {
        document.body.append(this);
        visibleModals.delete(this);
        for (const modal of visibleModals) {
            modal.classList.add("inactive");
        }
        this.classList.remove("inactive");
        visibleModals.add(this);
        this.initialFocus();
    }

    remove() {
        super.remove();
        visibleModals.delete(this);
        const lastModal = Array.from(visibleModals).at(-1);
        if (lastModal != null) {
            lastModal.classList.remove("inactive");
        }
    }

    close() {
        this.remove();
        this.dispatchEvent(new Event("close"));
    }

    #getModalFocusable() {
        const els = Array.from(this.shadowRoot.querySelectorAll(Q_TAB));
        return els.slice(1, -1);
    }

    #getContentFocusable() {
        return Array.from(this.querySelectorAll(Q_TAB));
    }

    initialFocus() {
        const contentEls = this.#getContentFocusable();
        if (contentEls.length) {
            contentEls[0].focus();
        } else {
            const modalEls = this.#getModalFocusable();
            if (modalEls.length) {
                modalEls[0].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

    focusFirst() {
        const modalEls = this.#getModalFocusable();
        if (modalEls.length) {
            modalEls[0].focus();
        } else {
            const contentEls = this.#getContentFocusable();
            if (contentEls.length) {
                contentEls[0].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

    focusLast() {
        const modalEls = this.#getModalFocusable();
        if (modalEls.length) {
            modalEls[modalEls.length - 1].focus();
        } else {
            const contentEls = this.#getContentFocusable();
            if (contentEls.length) {
                contentEls[contentEls.length - 1].focus();
            } else {
                const closeEl = this.shadowRoot.getElementById("close");
                closeEl.focus();
            }
        }
    }

}

customElements.define("emc-modal", Modal);
