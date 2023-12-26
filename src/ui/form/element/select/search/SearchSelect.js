import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import "../../../../i18n/builtin/I18nInput.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../../../util/I18n.js";
import CharacterSearch from "../../../../../util/search/CharacterSearch.js";
import {
    sortNodeList
} from "../../../../../util/helper/ui/NodeListSort.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import Comparator, {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import MutationObserverManager from "../../../../../util/observer/MutationObserverManager.js";
import "../../../../i18n/builtin/I18nOption.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};

const ESCAPE_KEYS = [
    "Tab",
    "Escape",
    "Enter"
];

const MUTATION_CONFIG = {
    attributes: true,
    characterData: true,
    attributeFilter: ["value"]
};

export default class SearchSelect extends CustomFormElementDelegating {

    #isEditMode = false;

    #value;

    #inputEl;

    #viewEl;

    #valueEl;

    #buttonEl;

    #placeholderEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n);

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionSelectEventManager.set("mousedown", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        this.#optionSelectEventManager.set("click", (event) => {
            this.#choose(event.currentTarget.getAttribute("value"));
            event.preventDefault();
            event.stopPropagation();
        });
        this.#optionSelectEventManager.set("mouseover", () => {
            const marked = this.#optionNodeList.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#placeholderEl = this.shadowRoot.getElementById("placeholder");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#buttonEl.addEventListener("click", (event) => {
            if (!this.#isEditMode) {
                this.#startEditMode();
            } else {
                this.#stopEditMode();
            }
            event.stopPropagation();
            event.preventDefault();
        });
        this.#viewEl.addEventListener("click", (event) => {
            if (!this.#isEditMode) {
                this.#startEditMode();
            }
            event.stopPropagation();
            event.preventDefault();
        });
        this.#inputEl.addEventListener("keydown", (event) => {
            if (!this.getBooleanAttribute("readonly")) {
                if (!this.#isEditMode) {
                    const {key} = event;
                    if (key === "ArrowUp") {
                        this.#switchSelected(true);
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (key === "ArrowDown") {
                        this.#switchSelected(false);
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (key === "Enter" || key === " ") {
                        this.#startEditMode();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                } else {
                    const {key} = event;
                    if (key === "ArrowUp") {
                        this.#moveMarker(true);
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (key === "ArrowDown") {
                        this.#moveMarker(false);
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (ESCAPE_KEYS.includes(key)) {
                        this.#stopEditMode();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        });
        this.#inputEl.addEventListener("blur", (event) => {
            if (event.relatedTarget != null && !event.relatedTarget.contains(this.#inputEl)) {
                this.#cancelSelection();
            }
            event.stopPropagation();
        });
        this.#inputEl.addEventListener("input", () => {
            const all = this.#optionNodeList.getNodeList();
            const regEx = new CharacterSearch(this.#inputEl.value);
            for (const el of all) {
                const testText = el.comparatorText ?? el.innerText;
                if (regEx.test(testText.trim())) {
                    el.style.display = "";
                } else {
                    el.style.display = "none";
                }
            }
        }, true);
        this.#scrollContainerEl.addEventListener("wheel", (event) => {
            event.stopPropagation();
        }, {passive: true});
        /* --- */
        window.addEventListener("wheel", () => {
            if (this.#isEditMode) {
                this.#cancelSelection();
            }
        }, {passive: true});
        window.addEventListener("blur", () => {
            if (this.#isEditMode) {
                this.#cancelSelection();
            }
        }, {passive: true});
        window.addEventListener("mousedown", (event) => {
            if (this.#isEditMode && !this.contains(event.target)) {
                this.#cancelSelection();
            }
        }, {passive: true});
        /* --- */
        this.#i18nEventManager.setActive(this.getBooleanAttribute("sorted"));
        this.#i18nEventManager.set("language", () => {
            this.#sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#sort();
        });
    }

    connectedCallback() {
        const value = this.value ?? this.#optionNodeList.first?.value;
        this.#value = value;
        this.#applyValue(value);
        this.internals.setFormValue(value);
        this.#resolveSlottedElements();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#viewEl.classList.toggle("disabled", disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = super.value || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value ?? super.value;
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set required(value) {
        this.setBooleanAttribute("required", value);
    }

    get required() {
        return this.getBooleanAttribute("required");
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    set sorted(value) {
        this.setBooleanAttribute("sorted", value);
    }

    get sorted() {
        return this.getBooleanAttribute("sorted");
    }

    static get observedAttributes() {
        return ["value", "placeholder", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    if (this.#value === undefined) {
                        this.#applyValue(this.value);
                        this.internals.setFormValue(this.value);
                        /* --- */
                        this.dispatchEvent(new Event("change"));
                    }
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    this.#placeholderEl.setAttribute("i18n-value", newValue)
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    const sorted = this.sorted;
                    this.#i18nEventManager.setActive(sorted);
                    if (sorted) {
                        this.#sort();
                    }
                }
            } break;
        }
    }

    #choose(value) {
        if (!this.getBooleanAttribute("readonly")) {
            if (this.#value != value) {
                this.value = value;
            }
            this.focus();
        }
        this.#stopEditMode();
    }

    #cancelSelection() {
        this.#applyValue(this.#value);
        this.#stopEditMode();
    }

    #startEditMode() {
        if (!this.getBooleanAttribute("readonly")) {
            this.#isEditMode = true;
            this.#inputEl.value = "";
            this.#inputEl.classList.add("active");
            this.#inputEl.focus();
            /* --- */
            const thisRect = this.getBoundingClientRect();
            this.#scrollContainerEl.style.display = "block";
            this.#scrollContainerEl.style.left = `${thisRect.left}px`;
            this.#scrollContainerEl.style.width = `${thisRect.width}px`;
            this.#scrollContainerEl.style.zIndex = 200;
            const containerRect = this.#scrollContainerEl.getBoundingClientRect();
            if (thisRect.bottom + containerRect.height > window.innerHeight - 25) {
                this.#scrollContainerEl.style.bottom = `${window.innerHeight - thisRect.top}px`;
            } else {
                this.#scrollContainerEl.style.top = `${thisRect.bottom}px`;
            }
            const all = this.#optionNodeList.querySelectorAll(`[value]`);
            for (const el of all) {
                el.style.display = "";
                if (el.value === this.#value) {
                    el.classList.add("selected");
                } else {
                    el.classList.remove("selected");
                }
            }
        }
    }

    #stopEditMode() {
        this.#isEditMode = false;
        this.#inputEl.classList.remove("active");
        this.#viewEl.focus();
        /* --- */
        this.#scrollContainerEl.style.display = "";
        this.#scrollContainerEl.style.bottom = "";
        this.#scrollContainerEl.style.top = "";
        this.#scrollContainerEl.style.zIndex = "";
        const all = this.querySelectorAll(`[value]`);
        for (const el of all) {
            el.style.display = "";
        }
        const marked = this.#optionNodeList.querySelector(".marked");
        if (marked != null) {
            marked.classList.remove("marked");
            this.value = marked.value;
        } else {
            this.#applyValue(this.#value);
        }
    }

    #applyValue(value) {
        if (value != null && value !== "") {
            const selectedEl = this.#optionNodeList.querySelector(`[value="${value}"]`);
            if (selectedEl != null) {
                if (selectedEl.i18nValue != null) {
                    this.#valueEl.i18nValue = selectedEl.i18nValue;
                } else {
                    this.#valueEl.i18nValue = "";
                    this.#valueEl.innerHTML = selectedEl.innerHTML;
                }
            } else {
                this.#valueEl.i18nValue = value;
            }
            this.#valueEl.classList.remove("hidden");
            this.#placeholderEl.classList.add("hidden");
        } else {
            this.#valueEl.i18nValue = "";
            this.#valueEl.classList.add("hidden");
            this.#placeholderEl.classList.remove("hidden");
        }
    }

    #switchSelected(modeUp = false) {
        const marked = this.#optionNodeList.querySelector(`[value="${this.#value}"]`);
        const el = this.#switchOption(marked, modeUp);
        if (el != null) {
            this.value = el.value;
        }
    }

    #moveMarker(modeUp = false) {
        const marked = this.#optionNodeList.querySelector(".marked");
        const el = this.#switchOption(marked, modeUp);
        if (el != null) {
            if (marked != null) {
                marked.classList.remove("marked");
            }
            el.classList.add("marked");
            const targetScroll = el.offsetTop - 20;
            if (this.#scrollContainerEl.scrollTop > targetScroll) {
                this.#scrollContainerEl.scrollTop = targetScroll;
            }
        }
    }

    #switchOption(oldEl, modeUp = false) {
        let nextEl;
        if (oldEl != null) {
            if (modeUp) {
                nextEl = this.#getPrevOption(oldEl);
                if (nextEl == null && oldEl.style.display == "none") {
                    nextEl = this.#getNextOption(oldEl);
                }
            } else {
                nextEl = this.#getNextOption(oldEl);
                if (nextEl == null && oldEl.style.display == "none") {
                    nextEl = this.#getPrevOption(oldEl);
                }
            }
        } else {
            nextEl = this.#optionNodeList.querySelector(`[value="${this.#value}"]`);
            if (nextEl == null) {
                nextEl = this.#getFirstOption();
            }
        }
        return nextEl;
    }

    #getFirstOption() {
        let nextEl = this.#optionNodeList.first;
        while (nextEl != null && (nextEl.style.display == "none" || !nextEl.matches("[value]"))) {
            nextEl = this.#optionNodeList.getNext(nextEl);
        }
        if (nextEl != null && nextEl.style.display != "none" && nextEl.matches("[value]")) {
            return nextEl;
        }
    }

    #getPrevOption(oldEl) {
        let nextEl = this.#optionNodeList.getPrev(oldEl);
        while (nextEl != null && (nextEl.style.display == "none" || !nextEl.matches("[value]"))) {
            nextEl = this.#optionNodeList.getPrev(nextEl);
        }
        if (nextEl != null && nextEl.style.display != "none" && nextEl.matches("[value]")) {
            return nextEl;
        }
    }

    #getNextOption(oldEl) {
        let nextEl = this.#optionNodeList.getNext(oldEl);
        while (nextEl != null && (nextEl.style.display == "none" || !nextEl.matches("[value]"))) {
            nextEl = this.#optionNodeList.getNext(nextEl);
        }
        if (nextEl != null && nextEl.style.display != "none" && nextEl.matches("[value]")) {
            return nextEl;
        }
    }

    #sort = debounce(() => {
        const optionNodeList = this.#optionNodeList.getNodeList();
        const sortedNodeList = sortNodeList(optionNodeList);
        if (!Comparator.isEqual(optionNodeList, sortedNodeList)) {
            for (const el of sortedNodeList) {
                (el.parentElement ?? el.getRootNode() ?? document).append(el);
            }
        }
        this.#optionNodeList.setNodeList(sortedNodeList);
    });

    #resolveSlottedElements() {
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        this.#optionSelectEventManager.clearTargets();
        for (const el of optionNodeList) {
            this.#optionSelectEventManager.addTarget(el);
            /* --- */
            if (oldNodes.has(el)) {
                oldNodes.delete(el);
            } else {
                newNodes.add(el);
            }
        }
        for (const node of oldNodes) {
            this.#mutationObserver.unobserve(node);
        }
        for (const node of newNodes) {
            this.#mutationObserver.observe(node);
        }
        /* --- */
        if (this.sorted) {
            this.#sort();
        }
        this.#applyValue(this.#value);
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

}

customElements.define("emc-select-search", SearchSelect);
