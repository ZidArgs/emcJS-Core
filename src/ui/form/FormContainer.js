import CustomElement from "../element/CustomElement.js";
import {debounce} from "../../util/Debouncer.js";
import {nodeOccurenceComparator} from "../../util/helper/ui/NodeListSort.js";
import MutationObserverManager from "../../util/observer/manager/MutationObserverManager.js";
import SectionTreeManager from "../../util/form/manager/SectionTreeManager.js";
import Tree from "../tree/Tree.js";
import FormSection from "./FormSection.js";
import TPL from "./FormContainer.js.html" assert {type: "html"};
import STYLE from "./FormContainer.js.css" assert {type: "css"};

const MUTATION_CONFIG = {
    childList: true,
    subtree: true
};

// TODO make formSectionNavigationElement collapse away on small screens
export default class FormContainer extends CustomElement {

    #containerEl;

    #contentEl;

    #formNodeList = [];

    #topFormResizeObserver;

    #bottomFormResizeObserver;

    #formSectionNavigationEl;

    #sectionNodeList = new Set();

    #sectionTreeManager = new SectionTreeManager();

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
        this.#mutationObserver.observe(this);
        this.#contentEl.addEventListener("scroll", () => {
            const sectionEls = [...this.#sectionNodeList].sort(nodeOccurenceComparator);
            let activeSection = sectionEls.shift();
            while (sectionEls.length && activeSection.isBodySquishedAway()) {
                activeSection = sectionEls.shift();
            }
            if (this.#activeSectionEl != activeSection) {
                this.#activeSectionEl = activeSection;
                if (this.#formSectionNavigationEl != null) {
                    if (activeSection != null) {
                        const sectionPath = this.#sectionTreeManager.getPath(activeSection);
                        this.#formSectionNavigationEl.selectItemByRefPath(sectionPath, true);
                    } else {
                        this.#formSectionNavigationEl.selectItemByPath(0, true);
                    }
                }
                const event = new Event("sectionchange");
                event.sectionEl = activeSection;
                this.dispatchEvent(event);
            }
        });
    }

    connectedCallback() {
        const sectionEls = this.querySelectorAll("emc-form-section");
        for (const node of sectionEls) {
            this.#addSection(node);
        }
    }

    disconnectedCallback() {
        const sectionEls = this.querySelectorAll("emc-form-section");
        for (const node of sectionEls) {
            this.#removeSection(node);
        }
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
            if (this.hasFooter) {
                this.#bottomFormResizeObserver.disconnect();
                const node = this.#formNodeList.at(-1);
                this.#bottomFormResizeObserver.observe(node);
                this.#applyScrollPaddingBottom(node);
            }
        }
    });

    #addSection(sectionEl) {
        this.#sectionNodeList.add(sectionEl);
        this.#sectionTreeManager.addSection(sectionEl);
        this.#updateSectionTree();
    }

    #addSectionRecursive(sectionEl) {
        const sectionEls = sectionEl.querySelectorAll("emc-form-section");
        this.#addSection(sectionEl);
        for (const node of sectionEls) {
            this.#addSection(node);
        }
        this.#updateSectionTree();
    }

    #removeSection(sectionEl) {
        this.#sectionNodeList.delete(sectionEl);
        this.#sectionTreeManager.removeSection(sectionEl);
        this.#updateSectionTree();
    }

    #removeSectionRecursive(sectionEl) {
        const sectionEls = sectionEl.querySelectorAll("emc-form-section");
        for (const node of sectionEls) {
            this.#removeSection(node);
        }
        this.#removeSection(sectionEl);
        this.#updateSectionTree();
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

    setFormSectionNavigationElement(node) {
        if (node != null && !(node instanceof Tree)) {
            throw new Error("form section navigation element must be an instance of Tree or null");
        }
        this.#formSectionNavigationEl = node;
        this.#updateSectionTree();
    }

    #updateSectionTree = debounce(() => {
        if (this.#formSectionNavigationEl != null) {
            this.#formSectionNavigationEl.loadConfig(this.#sectionTreeManager.treeConfig);
        }
    });

}

customElements.define("emc-form-container", FormContainer);
