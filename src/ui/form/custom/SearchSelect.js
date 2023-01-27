import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../util/I18n.js";
import SearchAnd from "../../../util/search/SearchAnd.js";
import {
    sortNodeList
} from "../../../util/helper/ui/sortNodeList.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import "./Option.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};
import Comparator from "../../../util/helper/Comparator.js";
import ElementListCache from "../../../util/html/ElementListCache.js";

/*
    TODO remove view element - make everything work with just the input
    TODO integrate as form control
    TODO add viewElement again to be able to show html properly
*/
export default class SearchSelect extends CustomFormElementDelegating {

    #isEditMode = false;

    #value = "";

    #inputEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager;

    #slotEventManager;

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionSelectEventManager = new EventMultiTargetManager();
        this.#optionSelectEventManager.set("mousedown", (event) => {
            this.#choose(event.currentTarget.getAttribute("value"));
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.#optionSelectEventManager.set("mouseover", () => {
            const marked = this.#optionNodeList.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        const buttonEl = this.shadowRoot.getElementById("button");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#slotEventManager = new EventTargetManager(this.#optionsContainerEl);
        this.#slotEventManager.set("slotchange", () => {
            this.#resolveSlottedElements()
        });
        /* --- */
        buttonEl.addEventListener("click", () => {
            if (!this.#isEditMode) {
                this.#startEditMode();
            }
        });
        this.#inputEl.addEventListener("click", () => {
            if (!this.#isEditMode) {
                this.#startEditMode();
            }
        });
        this.#inputEl.addEventListener("keydown", (event) => {
            if (!this.getBooleanAttribute("readonly")) {
                if (!this.#isEditMode) {
                    switch (event.key) {
                        case "ArrowUp": {
                            this.#switchSelected(true);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        case "ArrowDown": {
                            this.#switchSelected(false);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        case "Enter":
                        case " ": {
                            this.#startEditMode();
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    }
                } else {
                    switch (event.key) {
                        case "ArrowUp": {
                            this.#moveMarker(true);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        case "ArrowDown": {
                            this.#moveMarker(false);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        case "Enter":
                        case "Tab":
                        case "Escape": {
                            this.#stopEditMode();
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    }
                }
            }
        });
        this.addEventListener("blur", (event) => {
            this.#cancelSelection();
            event.stopPropagation();
            return false;
        });
        this.#inputEl.addEventListener("input", () => {
            const all = this.querySelectorAll(`[value]`);
            const regEx = new SearchAnd(this.#inputEl.value);
            for (const el of all) {
                if (el.innerText.trim().match(regEx)) {
                    el.style.display = "";
                } else {
                    el.style.display = "none";
                }
            }
        }, true);
        this.#scrollContainerEl.addEventListener("wheel", (event) => {
            event.stopPropagation();
            return false;
        }, {passive: true});
        /* --- */
        window.addEventListener("wheel", () => {
            if (this.#isEditMode) {
                this.#cancelSelection();
            }
        }, {passive: true});
        /* --- */
        this.#i18nEventManager.setActive(this.getBooleanAttribute("sort"));
        this.#i18nEventManager.set("language", () => {
            this.#sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#sort();
        });
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
        this.value = this.getAttribute("value") || "";
        this.#resolveSlottedElements();
        if (!this.#value) {
            this.value = this.#optionNodeList.first?.value;
        }
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    formResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        this.#value = value;
        this.#applyValue(value);
        this.internals.setFormValue(value);
        /* --- */
        this.dispatchEvent(new Event("change"));
    }

    get value() {
        return this.#value;
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

    static get observedAttributes() {
        return ["value", "placeholder", "sort"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    this.#inputEl.setAttribute(name, newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    // TODO if not edit mode
                    this.#inputEl.setAttribute("i18n-placeholder", newValue);
                }
            } break;
            case "sort": {
                if (oldValue != newValue) {
                    this.#i18nEventManager.setActive(this.getBooleanAttribute("sort"));
                }
            } break;
        }
    }

    #choose(value) {
        if (!this.getBooleanAttribute("readonly")) {
            if (this.#value != value) {
                this.value = value;
            }
        }
        this.#stopEditMode();
    }

    #cancelSelection() {
        this.#applyValue(this.#value);
        this.#stopEditMode();
    }

    #startEditMode() {
        // TODO change placeholder
        if (!this.getBooleanAttribute("readonly")) {
            this.#isEditMode = true;
            this.#inputEl.removeAttribute("readonly");
            this.#inputEl.value = "";
            /* --- */
            const thisRect = this.getBoundingClientRect();
            this.#scrollContainerEl.style.display = "block";
            this.#scrollContainerEl.style.left = `${thisRect.left}px`;
            this.#scrollContainerEl.style.width = `${thisRect.width}px`;
            const containerRect = this.#scrollContainerEl.getBoundingClientRect();
            if (thisRect.bottom + containerRect.height > window.innerHeight - 25) {
                this.#scrollContainerEl.style.bottom = `${window.innerHeight - thisRect.top}px`;
            } else {
                this.#scrollContainerEl.style.top = `${thisRect.bottom}px`;
            }
            const el = this.#optionNodeList.querySelector(`[value="${this.#value}"]`);
            if (el != null) {
                el.classList.add("marked");
            }
        }
    }

    #stopEditMode() {
        // TODO reset placeholder
        this.#isEditMode = false;
        this.#inputEl.setAttribute("readonly", "");
        /* --- */
        this.#scrollContainerEl.style.display = "";
        this.#scrollContainerEl.style.bottom = "";
        this.#scrollContainerEl.style.top = "";
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
        const el = this.#optionNodeList.querySelector(`[value="${value}"]`);
        if (el != null) {
            this.#inputEl.value = el.innerHTML;
        } else {
            this.#inputEl.value = value;
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
            nextEl = this.querySelector(`[value="${this.#value}"]`);
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
        this.#slotEventManager.setActive(false);
        const optionNodeList = this.#optionNodeList.getNodeList();
        const sortedNodeList = sortNodeList(optionNodeList);
        if (!Comparator.isEqual(this.#optionNodeList, sortedNodeList)) {
            for (const el of sortedNodeList) {
                (el.parentElement ?? el.getRootNode() ?? document).append(el);
            }
        }
        this.#optionNodeList.setNodeList(sortedNodeList);
        this.#slotEventManager.setActive(true);
    });

    #resolveSlottedElements() {
        const optionNodeList = this.#optionsContainerEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        this.#optionSelectEventManager.clearTargets();
        for (const el of optionNodeList) {
            this.#optionSelectEventManager.addTarget(el);
            if (el.value == this.value) {
                this.#inputEl.innerHTML = el.innerHTML;
            }
        }
        /* --- */
        if (this.getBooleanAttribute("sort")) {
            this.#sort();
        }
    }

    setCustomValidity(message) {
        if (typeof message === "string" && message !== "") {
            this.internals.setValidity({customError: true}, message);
        } else {
            this.internals.setValidity({}, "");
        }
    }

}

customElements.define("emc-select-search", SearchSelect);
