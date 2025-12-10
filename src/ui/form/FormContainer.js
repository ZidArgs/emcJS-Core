import CustomElement from "../element/CustomElement.js";
import {debounce} from "../../util/Debouncer.js";
import TPL from "./FormContainer.js.html" assert {type: "html"};
import STYLE from "./FormContainer.js.css" assert {type: "css"};
import MutationObserverManager from "../../util/observer/manager/MutationObserverManager.js";
import {nodeOccurenceComparator} from "../../util/helper/ui/NodeListSort.js";
import FormSection from "./FormSection.js";

const MUTATION_CONFIG = {
    childList: true,
    subtree: true
};

export default class FormContainer extends CustomElement {

    #containerEl;

    #contentEl;

    #formNodeList = [];

    #topFormResizeObserver;

    #bottomFormResizeObserver;

    #sectionNodeSet = new Set();

    #sectionNodeList = [];

    #activeSectionEl;

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                    if (node instanceof FormSection) {
                        this.#addSectionRecursive(node);
                    }
                }
                for (const node of mutation.removedNodes) {
                    if (node instanceof FormSection) {
                        this.#removeSectionRecursive(node);
                    }
                }
            }
        }
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#contentEl = this.shadowRoot.getElementById("content");
        /* --- */
        this.#topFormResizeObserver = new ResizeObserver((entries) => {
            this.#applyScrollPaddingTop(entries[0].target);
        });
        this.#bottomFormResizeObserver = new ResizeObserver((entries) => {
            this.#applyScrollPaddingBottom(entries[0].target);
        });
        /* --- */
        this.#contentEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        this.#onSlotChange();
        /* --- */
        this.#contentEl.addEventListener("scroll", () => {
            this.#refreshSecctionState();
        });
    }

    connectedCallback() {
        this.#mutationObserver.observe(this);
        setTimeout(() => {
            const sectionEls = this.querySelectorAll("emc-form-section");
            for (const node of sectionEls) {
                this.#addSection(node);
            }
        }, 0);
    }

    disconnectedCallback() {
        this.#mutationObserver.unobserve(this);
        const sectionEls = this.querySelectorAll("emc-form-section");
        for (const node of sectionEls) {
            this.#removeSection(node);
        }
    }

    resetScroll() {
        this.#containerEl.scrollTop = 0;
        this.#containerEl.scrollLeft = 0;
    }

    get sectionNodeList() {
        return [...this.#sectionNodeList];
    }

    get activeSection() {
        return this.#activeSectionEl;
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
            if (this.hasFooter) {
                this.#bottomFormResizeObserver.disconnect();
                const node = this.#formNodeList.at(-1);
                this.#bottomFormResizeObserver.observe(node);
                this.#applyScrollPaddingBottom(node);
            }
        }
    });

    #addSection(sectionEl) {
        this.#sectionNodeSet.add(sectionEl);
        this.#onSectionListChanged();
    }

    #addSectionRecursive(sectionEl) {
        const sectionEls = sectionEl.querySelectorAll("emc-form-section");
        this.#addSection(sectionEl);
        for (const node of sectionEls) {
            this.#addSection(node);
        }
    }

    #removeSection(sectionEl) {
        this.#sectionNodeSet.delete(sectionEl);
        this.#onSectionListChanged();
    }

    #removeSectionRecursive(sectionEl) {
        const sectionEls = sectionEl.querySelectorAll("emc-form-section");
        for (const node of sectionEls) {
            this.#removeSection(node);
        }
        this.#removeSection(sectionEl);
    }

    #applyScrollPaddingTop(node) {
        const nodeRect = node.getBoundingClientRect();
        this.#containerEl.style.scrollPaddingTop = `${nodeRect.height}px`;
        this.#contentEl.style.setProperty("--form-header-height", `${nodeRect.height}px`);
    }

    #applyScrollPaddingBottom(node) {
        const nodeRect = node.getBoundingClientRect();
        this.#containerEl.style.scrollPaddingBottom = `${nodeRect.height}px`;
        this.#contentEl.style.setProperty("--form-footer-height", `${nodeRect.height}px`);
    }

    #onSectionListChanged = debounce(() => {
        this.#sectionNodeList = [...this.#sectionNodeSet].sort(nodeOccurenceComparator);
        const event = new Event("sectionlist_change");
        event.sectionList = [...this.#sectionNodeList];
        this.dispatchEvent(event);
        this.#refreshSecctionState();
    });

    #refreshSecctionState() {
        const sectionEls = [...this.#sectionNodeList];
        for (const sectionEl of sectionEls) {
            sectionEl.refreshState();
        }
        let activeSection = sectionEls.shift();
        while (sectionEls.length && activeSection.bodyVisibleHeight < 20) {
            activeSection = sectionEls.shift();
        }
        if (this.#activeSectionEl != activeSection) {
            if (this.#activeSectionEl != null) {
                this.#activeSectionEl.classList.remove("active");
            }
            activeSection.classList.add("active");
            this.#activeSectionEl = activeSection;
            const event = new Event("section_change");
            event.section = activeSection;
            this.dispatchEvent(event);
        }
    }

}

customElements.define("emc-form-container", FormContainer);
