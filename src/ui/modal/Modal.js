import CustomElement from "../element/CustomElement.js";
import UniqueEntriesStack from "../../data/stack/UniqueEntriesStack.js";
import {isColorString} from "../../util/helper/CheckType.js";
import {getFocusableElements} from "../../util/helper/html/ElementFocusHelper.js";
import "../i18n/I18nLabel.js";
import "../symbols/CloseSymbol.js";
import TPL from "./Modal.js.html" assert {type: "html"};
import STYLE from "./Modal.js.css" assert {type: "css"};

const SIZE_REGEXP = /^[0-9]+(?:\.[0-9]+)?(?:em|px|%)$/;

const modalStorage = new Map();

const visibleModals = new UniqueEntriesStack();

export default class Modal extends CustomElement {

    #modalEl;

    #titleIconEl;

    #titleTextEl;

    #closeEl;

    #textEl;

    #footerEl;

    #focusTopEl;

    #focusBottomEl;

    #assocName = "";

    constructor(caption) {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#modalEl = this.shadowRoot.getElementById("modal");
        this.#titleIconEl = this.shadowRoot.getElementById("title-icon");
        this.#titleTextEl = this.shadowRoot.getElementById("title-text");
        this.#closeEl = this.shadowRoot.getElementById("close");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#footerEl = this.shadowRoot.getElementById("footer");
        this.caption = caption;
        /* --- */
        this.#modalEl.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                this.close();
                event.stopPropagation();
            }
        });
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

    get assocName() {
        return this.#assocName;
    }

    disconnectedCallback() {
        this.classList.remove("inactive");
    }

    set caption(value) {
        this.setStringAttribute("caption", value);
    }

    get caption() {
        return this.getStringAttribute("caption");
    }

    set streched(value) {
        this.setBooleanAttribute("streched", value);
    }

    get streched() {
        return this.getBooleanAttribute("streched");
    }

    static get observedAttributes() {
        return ["caption"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "caption": {
                if (oldValue != newValue) {
                    this.#titleTextEl.i18nValue = newValue;
                }
            } break;
        }
    }

    setFontIcon(content, opts = {}) {
        const {
            color, size, circle = false
        } = opts;
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
            return true;
        } else {
            this.#titleIconEl.innerText = "❖";
            this.#titleIconEl.style.backgroundImage = "";
            this.#titleIconEl.style.color = "";
            this.#titleIconEl.classList.remove("small");
            return false;
        }
    }

    setImageIcon(content) {
        this.#titleIconEl.classList.remove("small");
        if (typeof content === "string" && content !== "") {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.style.backgroundImage = content;
            this.#titleIconEl.style.color = "";
            return true;
        } else {
            this.#titleIconEl.innerText = "❖";
            this.#titleIconEl.style.backgroundImage = "";
            this.#titleIconEl.style.color = "";
            return false;
        }
    }

    setHTMLIcon(content) {
        this.#titleIconEl.classList.remove("small");
        if (content instanceof HTMLElement) {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.append(content);
            return true;
        } else {
            this.#titleIconEl.innerText = "❖";
            this.#titleIconEl.style.backgroundImage = "";
            this.#titleIconEl.style.color = "";
            return false;
        }
    }

    setIcon(config) {
        switch (config.method) {
            case "font": {
                return this.setFontIcon(config.content, config.style);
            }
            case "image": {
                return this.setImageIcon(config.content);
            }
            case "html": {
                return this.setHTMLIcon(config.content);
            }
            default: {
                this.#titleIconEl.innerText = "❖";
                this.#titleIconEl.style.backgroundImage = "";
                this.#titleIconEl.style.color = "";
                return false;
            }
        }
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

    #getTextFocusable() {
        return getFocusableElements(this.#textEl);
    }

    #getContentFocusable() {
        return getFocusableElements(this);
    }

    #getFooterFocusable() {
        return getFocusableElements(this.#footerEl);
    }

    initialFocus() {
        const textEls = this.#getTextFocusable();
        if (textEls.length) {
            textEls[0].focus();
        } else {
            const contentEls = this.#getContentFocusable();
            if (contentEls.length) {
                contentEls[0].focus();
            } else  {
                const footerEls = this.#getFooterFocusable();
                if (footerEls.length) {
                    footerEls[0].focus();
                } else {
                    this.#closeEl.focus();
                }
            }
        }
    }

    focusFirst() {
        this.#closeEl.focus();
    }

    focusLast() {
        const footerEls = this.#getFooterFocusable();
        if (footerEls.length) {
            footerEls.at(-1).focus();
        } else {
            const contentEls = this.#getContentFocusable();
            if (contentEls.length) {
                contentEls.at(-1).focus();
            } else  {
                const textEls = this.#getTextFocusable();
                if (textEls.length) {
                    textEls.at(-1).focus();
                } else {
                    this.#closeEl.focus();
                }
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

    static closeAll() {
        while (visibleModals.size > 0) {
            visibleModals.pop().close();
        }
    }

}

customElements.define("emc-modal", Modal);
