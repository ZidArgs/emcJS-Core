import CustomElement from "../../element/CustomElement.js";
import I18nLabel from "../../i18n/I18nLabel.js";
import UniqueEntriesStack from "../../../data/stack/UniqueEntriesStack.js";
import "../../symbols/CloseSymbol.js";
import TPL from "./Window.js.html" assert {type: "html"};
import STYLE from "./Window.js.css" assert {type: "css"};

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

const visibleModals = new UniqueEntriesStack();

export default class Window extends CustomElement {

    #titleEl;

    #closeEl;

    #focusTopEl;

    #focusBottomEl;

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
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#titleEl.append(I18nLabel.getLabel(title));
        this.#closeEl = this.shadowRoot.getElementById("close");
        if (!!close && typeof close === "string") {
            this.#closeEl.setAttribute("title", close);
        }
        this.#closeEl.addEventListener("click", () => this.close());
        /* --- */
        this.#focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        this.#focusTopEl.addEventListener("focus", () => {
            this.focusLast();
        });
        this.#focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        this.#focusBottomEl.addEventListener("focus", () => {
            this.focusFirst();
        });
    }

    disconnectedCallback() {
        this.classList.remove("inactive");
    }

    show() {
        document.body.append(this);
        const oldModal = visibleModals.peek();
        if (oldModal != null) {
            oldModal.classList.add("inactive");
        }
        this.classList.remove("inactive");
        visibleModals.push(this);
        this.initialFocus();
    }

    remove() {
        super.remove();
        if (visibleModals.peek() === this) {
            visibleModals.pop();
            const lastModal = visibleModals.peek();
            if (lastModal != null) {
                lastModal.classList.remove("inactive");
            }
        } else {
            visibleModals.delete(this);
        }
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
                this.#closeEl.focus();
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
                this.#closeEl.focus();
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
                this.#closeEl.focus();
            }
        }
    }

}

customElements.define("emc-window", Window);
