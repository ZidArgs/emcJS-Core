import CustomElement from "../element/CustomElement.js";
import UniqueEntriesStack from "../../data/stack/UniqueEntriesStack.js";
import EventTargetManager from "../../util/event/EventTargetManager.js";
import {
    isColorString, isPrimitive,
    isStringNotEmpty
} from "../../util/helper/CheckType.js";
import {getFocusableElements} from "../../util/helper/html/ElementFocusHelper.js";
import BusyIndicatorController from "../../util/BusyIndicatorController.js";
import BusyIndicator from "../BusyIndicator.js";
import "../i18n/I18nLabel.js";
import "../symbols/CloseSymbol.js";
import "../icon/FAIcon.js";
import "../icon/FontIcon.js";
import TPL from "./Modal.js.html" assert {type: "html"};
import STYLE from "./Modal.js.css" assert {type: "css"};

const SIZE_REGEXP = /^[0-9]+(?:\.[0-9]+)?(?:em|px|%)$/;

const modalStorage = new Map();

const visibleModals = new UniqueEntriesStack();

const focusEventManager = new EventTargetManager(window, false);
focusEventManager.set("focus", (event) => {
    if (visibleModals.size > 0) {
        const modal = visibleModals.peek();
        const target = event.target;
        if (target instanceof Node && !modal.contains(target)) {
            modal.initialFocus();
        }
    }
}, {capture: true});

export default class Modal extends CustomElement {

    #busyIndicator = new BusyIndicator(this);

    #busyIndicatorControler = new BusyIndicatorController(this.#busyIndicator);

    #focusTopEl;

    #focusBottomEl;

    #modalEl;

    #titleIconContainerEl;

    #titleIconEl;

    #titleFontIconEl;

    #titleTextEl;

    #closeEl;

    #textEl;

    #footerEl;

    #assocName = "";

    constructor(caption, modalClass) {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#modalEl = this.shadowRoot.getElementById("modal");
        this.#titleIconContainerEl = this.shadowRoot.getElementById("title-icon-container");
        this.#titleIconEl = this.shadowRoot.getElementById("title-icon");
        this.#titleFontIconEl = this.shadowRoot.getElementById("title-font-icon");
        this.#titleTextEl = this.shadowRoot.getElementById("title-text");
        this.#closeEl = this.shadowRoot.getElementById("close");
        this.#textEl = this.shadowRoot.getElementById("text");
        this.#footerEl = this.shadowRoot.getElementById("footer");
        this.caption = caption;
        if (isStringNotEmpty(modalClass)) {
            this.#modalEl.classList.add(modalClass);
        }
        /* --- */
        this.registerTargetEventHandler(this.#modalEl, "keydown", (event) => {
            if (this.busy) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (event.key == "Escape") {
                this.close();
                event.stopPropagation();
            }
        });
        this.registerTargetEventHandler(this.#closeEl, "click", () => {
            if (!this.busy) {
                this.close();
            }
        });
        /* --- */
        this.#focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        this.registerTargetEventHandler(this.#focusTopEl, "focus", () => {
            this.focusLast();
        });
        this.#focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        this.registerTargetEventHandler(this.#focusBottomEl, "focus", () => {
            this.focusFirst();
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this.classList.remove("inactive");
    }

    get busyIndicator() {
        return this.#busyIndicatorControler;
    }

    get assocName() {
        return this.#assocName;
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

    set resizable(value) {
        this.setBooleanAttribute("resizable", value);
    }

    get resizable() {
        return this.getBooleanAttribute("resizable");
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

    setIcon(config) {
        if (isPrimitive(config)) {
            config = {content: config.toString()};
        }
        this.#resetIcon();
        this.#applyIconStyle(config.style);
        const content = config.content;
        switch (config.type) {
            case "html": {
                if (content instanceof HTMLElement) {
                    this.#titleIconEl.append(content);
                    return true;
                }
            } break;
            case "font": {
                if (typeof content === "string" && content !== "") {
                    this.#titleIconContainerEl.setAttribute("icon-type", "font");
                    this.#titleFontIconEl.icon = content;
                    return true;
                }
            } break;
            case "image": {
                if (typeof content === "string" && content !== "") {
                    this.#titleIconContainerEl.setAttribute("icon-type", "image");
                    this.#titleIconEl.style.backgroundImage = content;
                    this.#titleIconEl.style.backgroundSize = "80%";
                    this.#titleIconEl.innerText = "";
                    return true;
                }
            } break;
            case "url": {
                if (typeof content === "string" && content !== "") {
                    this.#titleIconContainerEl.setAttribute("icon-type", "image");
                    this.#titleIconEl.style.backgroundImage = `url("${content}")`;
                    this.#titleIconEl.style.backgroundSize = "80%";
                    this.#titleIconEl.innerText = "";
                    return true;
                }
            } break;
            default: {
                if (typeof content === "string" && content !== "") {
                    this.#titleIconContainerEl.setAttribute("icon-type", "char");
                    this.#titleIconEl.innerText = content;
                    return true;
                }
            } break;
        }
        return false;
    }

    #applyIconStyle(style) {
        const {
            size, color, shadow = false
        } = style;
        if (SIZE_REGEXP.test(size)) {
            this.#titleIconContainerEl.style.fontSize = size;
        }
        if (isColorString(color)) {
            this.#titleIconContainerEl.style.color = color;
        }
        if (shadow) {
            if (isColorString(shadow)) {
                this.#titleIconContainerEl.style.filter = `drop-shadow(${shadow} 1px 1px 1px)`;
            } else {
                this.#titleIconContainerEl.style.filter = "drop-shadow(var(--modal-icon-shadow-color, #000000aa) 1px 1px 1px)";
            }
        }
    }

    #resetIcon() {
        this.#titleIconEl.innerText = "";
        this.#titleIconEl.style.backgroundImage = "";
        this.#titleIconEl.style.backgroundSize = "";
        this.#titleFontIconEl.icon = "";

        this.#titleIconContainerEl.style.fontSize = "";
        this.#titleIconContainerEl.style.color = "";
        this.#titleIconContainerEl.style.filter = "";
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
        focusEventManager.active = true;
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
        if (visibleModals.size === 0) {
            focusEventManager.active = false;
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
