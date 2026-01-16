import CustomElement from "../element/CustomElement.js";
import UniqueEntriesStack from "../../data/stack/UniqueEntriesStack.js";
import {isColorString} from "../../util/helper/CheckType.js";
import {isSVGPath} from "../../util/helper/SVGPath.js";
import {getFocusableElements} from "../../util/helper/html/ElementFocusHelper.js";
import "../i18n/I18nLabel.js";
import "../symbols/CloseSymbol.js";
import TPL from "./Modal.js.html" assert {type: "html"};
import STYLE from "./Modal.js.css" assert {type: "css"};
import BusyIndicator from "../BusyIndicator.js";

const SIZE_REGEXP = /^[0-9]+(?:\.[0-9]+)?(?:em|px|%)$/;

const modalStorage = new Map();

const visibleModals = new UniqueEntriesStack();

export default class Modal extends CustomElement {

    #busyIndicator = new BusyIndicator(this);

    #focusTopEl;

    #focusBottomEl;

    #modalEl;

    #titleIconEl;

    #titleTextEl;

    #closeEl;

    #textEl;

    #footerEl;

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

    set busy(value) {
        if (value !== this.#busyIndicator.isBusy()) {
            if (value) {
                this.#busyIndicator.busy();
            } else {
                this.#busyIndicator.reset();
            }
        }
    }

    get busy() {
        return this.#busyIndicator.isBusy();
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
        this.#resetIcon();
        const {
            color, size, circle = false, shadow = false
        } = opts;
        if (typeof content === "string" && content !== "") {
            this.#titleIconEl.innerText = content;
            if (SIZE_REGEXP.test(size)) {
                this.#titleIconEl.style.fontSize = size;
            }
            if (isColorString(color)) {
                this.#titleIconEl.style.color = color;
            }
            if (circle) {
                if (isColorString(circle)) {
                    this.#titleIconEl.style.backgroundImage = `radial-gradient(transparent 45%, ${circle}, transparent 55%)`;
                } else if (isColorString(color)) {
                    this.#titleIconEl.style.backgroundImage = `radial-gradient(transparent 45%, ${color}, transparent 55%)`;
                } else {
                    this.#titleIconEl.style.backgroundImage = "radial-gradient(transparent 45%, var(--modal-icon-default-color, #222222), transparent 55%)";
                }
            }
            if (shadow) {
                if (isColorString(shadow)) {
                    this.#titleIconEl.style.filter = `drop-shadow(${shadow} 1px 1px 1px)`;
                } else if (isColorString(color)) {
                    this.#titleIconEl.style.filter = `drop-shadow(${color} 1px 1px 1px)`;
                } else {
                    this.#titleIconEl.style.filter = "drop-shadow(var(--modal-icon-shadow-color, #ffffff) 1px 1px 1px)";
                }
            }
            return true;
        }
        return false;
    }

    setImageIcon(content, opts = {}) {
        this.#resetIcon();
        const {shadow = false} = opts;
        if (typeof content === "string" && content !== "") {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.style.backgroundImage = `url(${content})`;
            this.#titleIconEl.style.backgroundSize = "80%";
            if (shadow) {
                if (isColorString(shadow)) {
                    this.#titleIconEl.style.filter = `drop-shadow(${shadow} 1px 1px 1px)`;
                } else {
                    this.#titleIconEl.style.filter = "drop-shadow(var(--modal-icon-shadow-color, #ffffff) 1px 1px 1px)";
                }
            }
            return true;
        }
        return false;
    }

    setPathIcon(size, content, opts = {}) {
        this.#resetIcon();
        const {
            color, shadow = false
        } = opts;
        if (isSVGPath(content)) {
            this.#titleIconEl.innerText = "";
            const fillColor = isColorString(color) ? color : "#000000";
            const width = parseInt(size?.width) || 100;
            const height = parseInt(size?.height) || 100;
            const viewBox = `0 0 ${width} ${height}`;
            const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${content}" fill="${fillColor}"" /></svg>`;
            this.#titleIconEl.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa(svgData)}')`;
            this.#titleIconEl.style.backgroundSize = "80%";
            if (shadow) {
                if (isColorString(shadow)) {
                    this.#titleIconEl.style.filter = `drop-shadow(${shadow} 1px 1px 1px)`;
                } else {
                    this.#titleIconEl.style.filter = "drop-shadow(var(--modal-icon-shadow-color, #ffffff) 1px 1px 1px)";
                }
            }
            return true;
        }
        return false;
    }

    setHTMLIcon(content) {
        this.#resetIcon();
        if (content instanceof HTMLElement) {
            this.#titleIconEl.innerText = "";
            this.#titleIconEl.append(content);
            return true;
        }
        return false;
    }

    setIcon(config) {
        switch (config.method) {
            case "font": {
                return this.setFontIcon(config.content, config.style);
            }
            case "image": {
                return this.setImageIcon(config.content, config.style);
            }
            case "path": {
                return this.setPathIcon(config.size, config.content, config.style);
            }
            case "html": {
                return this.setHTMLIcon(config.content);
            }
        }
        this.#resetIcon();
        return false;
    }

    #resetIcon() {
        this.#titleIconEl.innerText = "❖";
        this.#titleIconEl.style.fontSize = "";
        this.#titleIconEl.style.backgroundImage = "";
        this.#titleIconEl.style.backgroundSize = "";
        this.#titleIconEl.style.color = "";
        this.#titleIconEl.style.filter = "";
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
