import CustomElement from "../element/CustomElement.js";
import TPL from "./FormContainer.js.html" assert {type: "html"};
import STYLE from "./FormContainer.js.css" assert {type: "css"};
import {
    debounce
} from "../../util/Debouncer.js";

export default class FormContainer extends CustomElement {

    #containerEl;

    #contentEl;

    #formNodeList = [];

    #topFormResizeObserver;

    #bottomFormResizeObserver;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        /* --- */
        this.#topFormResizeObserver = new ResizeObserver((entries) => {
            this.#applyScrollPaddingTop(entries[0].target);
        });
        this.#bottomFormResizeObserver = new ResizeObserver((entries) => {
            this.#applyScrollPaddingBottom(entries[0].target);
        });
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#contentEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        this.#onSlotChange();
    }

    resetScroll() {
        this.#containerEl.scrollTop = 0;
        this.#containerEl.scrollLeft = 0;
    }

    set hasHeader(value) {
        this.setBooleanAttribute("hasheader", value);
    }

    get hasHeader() {
        return this.getBooleanAttribute("hasheader");
    }

    set hasFooter(value) {
        this.setBooleanAttribute("hasfooter", value);
    }

    get hasFooter() {
        return this.getBooleanAttribute("hasfooter");
    }

    set noScroll(value) {
        this.setBooleanAttribute("noscroll", value);
    }

    get noScroll() {
        return this.getBooleanAttribute("noscroll");
    }

    static get observedAttributes() {
        return ["hasheader", "hasfooter"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "hasheader": {
                if (oldValue != newValue) {
                    this.#topFormResizeObserver.disconnect();
                    if (this.hasHeader && this.#formNodeList.length > 1) {
                        const node = this.#formNodeList.at(0);
                        this.#topFormResizeObserver.observe(node);
                        this.#applyScrollPaddingTop(node);
                    }
                }
            } break;
            case "hasfooter": {
                if (oldValue != newValue) {
                    this.#topFormResizeObserver.disconnect();
                    if (this.hasFooter && this.#formNodeList.length > 1) {
                        const node = this.#formNodeList.at(-1);
                        this.#bottomFormResizeObserver.observe(node);
                        this.#applyScrollPaddingBottom(node);
                    }
                }
            } break;
        }
    }

    #onSlotChange = debounce(() => {
        this.#formNodeList = this.#contentEl.assignedElements({flatten: true}).filter((el) => el instanceof HTMLFormElement);
        if (this.#formNodeList.length > 1) {
            if (this.hasHeader) {
                this.#topFormResizeObserver.disconnect();
                const node = this.#formNodeList.at(0);
                this.#topFormResizeObserver.observe(node);
                this.#applyScrollPaddingTop(node);
            }
            if (this.hasHeader) {
                this.#bottomFormResizeObserver.disconnect();
                const node = this.#formNodeList.at(-1);
                this.#bottomFormResizeObserver.observe(node);
                this.#applyScrollPaddingBottom(node);
            }
        }
    });

    #applyScrollPaddingTop(node) {
        this.#containerEl.style.scrollPaddingTop = `${node.clientHeight}px`;
    }

    #applyScrollPaddingBottom(node) {
        this.#containerEl.style.scrollPaddingBottom = `${node.clientHeight}px`;
    }

}

customElements.define("emc-form-container", FormContainer);
