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

    #headerEl;

    #footerEl;

    #contentEl;

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
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#footerEl = this.shadowRoot.getElementById("footer");
        this.#contentEl = this.shadowRoot.getElementById("content");
        /* --- */
        this.registerTargetEventHandler(this.#headerEl, "slotchange", () => {
            this.#onHeaderSlotChange();
        });
        this.#onHeaderSlotChange();
        /* --- */
        this.registerTargetEventHandler(this.#footerEl, "slotchange", () => {
            this.#onFooterSlotChange();
        });
        this.#onFooterSlotChange();
        /* --- */
        this.registerTargetEventHandler(this.#contentEl, "scroll", () => {
            this.#refreshSectionState();
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#mutationObserver.observe(this);
        setTimeout(() => {
            const sectionEls = this.querySelectorAll("emc-form-section");
            for (const node of sectionEls) {
                this.#addSection(node);
            }
        }, 0);
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
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

    set noScroll(value) {
        this.setBooleanAttribute("noscroll", value);
    }

    get noScroll() {
        return this.getBooleanAttribute("noscroll");
    }

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

    #onSectionListChanged = debounce(() => {
        this.#sectionNodeList = [...this.#sectionNodeSet].sort(nodeOccurenceComparator);
        const event = new Event("sectionlist_change");
        event.sectionList = [...this.#sectionNodeList];
        this.dispatchEvent(event);
        this.#refreshSectionState();
    });

    #refreshSectionState() {
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
            if (activeSection != null) {
                activeSection.classList.add("active");
            }
            this.#activeSectionEl = activeSection;
            const event = new Event("section_change");
            event.section = activeSection;
            this.dispatchEvent(event);
        }
    }

    #onHeaderSlotChange = debounce(() => {
        const elementList = this.#headerEl.assignedElements({flatten: true}).filter((el) => el instanceof HTMLFormElement);
        this.#headerEl.classList.toggle("has-slotted", elementList.length > 0);
    });

    #onFooterSlotChange = debounce(() => {
        const elementList = this.#footerEl.assignedElements({flatten: true}).filter((el) => el instanceof HTMLFormElement);
        this.#footerEl.classList.toggle("has-slotted", elementList.length > 0);
    });

}

customElements.define("emc-form-container", FormContainer);
