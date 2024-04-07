import CustomElement from "../element/CustomElement.js";
import UniqueEntriesStack from "../../data/stack/UniqueEntriesStack.js";
import {
    isColorString
} from "../../util/helper/CheckType.js";
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

const SIZE_REGEXP = /^[0-9]+(?:\.[0-9]+)?(?:em|px|%)$/;

const modalStorage = new Map();

const visibleModals = new UniqueEntriesStack();

export default class Modal extends CustomElement {

    #titleIconEl;

    #titleTextEl;

    #assocName = "";

    constructor(title = "", close = "close") {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#titleIconEl = this.shadowRoot.getElementById("title-icon");
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

    get assocName() {
        return this.#assocName;
    }

    disconnectedCallback() {
        this.classList.remove("inactive");
    }

    setFontIcon(content, {color, size, circle = false} = {}) {
        if (typeof content === "string" && content !== "") {
            this.#titleIconEl.innerText = content;
            if (SIZE_REGEXP.test(size)) {
                this.#titleIconEl.style.fontSize = size;
            }
            if (isColorString(color)) {
                this.#titleIconEl.style.color = color;
            } else {
                this.#titleIconEl.style.color = "";
            }
            if (circle) {
                if (isColorString(circle)) {
                    this.#titleIconEl.style.backgroundImage = `radial-gradient(transparent 45%, ${circle}, transparent 55%)`;
                } else {
                    this.#titleIconEl.style.backgroundImage = "radial-gradient(transparent 45%, black, transparent 55%)";
                }
                this.#titleIconEl.classList.add("small");
            } else {
                this.#titleIconEl.style.backgroundImage = "";
                this.#titleIconEl.classList.remove("small");
            }
            this.#titleIconEl.classList.add("visible");
        } else {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.style.backgroundImage = "";
            this.#titleIconEl.style.color = "";
            this.#titleIconEl.classList.remove("visible");
        }
    }

    setImageIcon(content) {
        if (typeof content === "string" && content !== "") {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.style.backgroundImage = content;
            this.#titleIconEl.style.color = "";
            this.#titleIconEl.classList.add("visible");
        } else {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.style.backgroundImage = "";
            this.#titleIconEl.style.color = "";
            this.#titleIconEl.classList.remove("visible");
        }
    }

    setTitle(value) {
        this.#titleTextEl.i18nValue = value;
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

    static getModalByName(name) {
        if (typeof name !== "string" || name === "") {
            return new this();
        }
        if (modalStorage.has(this)) {
            const modalsForType = modalStorage.get(this);
            if (modalsForType.has(name)) {
                return modalsForType.get(name);
            }
            const modal = new this();
            modal.#assocName = name;
            modalsForType.set(name, modal);
            return modal;
        }
        const modalsForType = new Map();
        const modal = new this();
        modal.#assocName = name;
        modalsForType.set(name, modal);
        modalStorage.set(this, modalsForType);
        return modal;
    }

}

customElements.define("emc-modal", Modal);
