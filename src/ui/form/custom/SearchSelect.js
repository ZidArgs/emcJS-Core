import CustomFormElementDelegating from "../../element/CustomFormElementDelegating.js";
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../util/I18n.js";
import SearchLoose from "../../../util/search/SearchLoose.js";
import {
    sortNodeList
} from "../../../util/helper/ui/sortNodeList.js";
import {
    debounce
} from "../../../util/Debouncer.js";
import Comparator from "../../../util/helper/Comparator.js";
import ElementListCache from "../../../util/html/ElementListCache.js";
import "../../i18n/I18nLabel.js";
import "./Option.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};

const BLACKLIST = [
    "Tab",
    "AltGraph",
    "Capslock",
    "Numlock"
];

const CONTROL_KEYS = [
    "Tab",
    "Control",
    "AltGraph",
    "Shift",
    "Alt",
    "Meta",
    "Capslock",
    "Numlock",
    "Escape"
];

const ESCAPE_KEYS = [
    "Tab",
    "Escape",
    "Enter"
];

export default class SearchSelect extends CustomFormElementDelegating {

    #isEditMode = false;

    #value = "";

    #inputEl;

    #viewEl;

    #buttonEl;

    #placeholderEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager;

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
        });
        this.#optionSelectEventManager.set("mouseover", () => {
            const marked = this.#optionNodeList.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#placeholderEl = this.shadowRoot.getElementById("placeholder");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsContainerEl.addEventListener("slotchange", () => {
            this.#resolveSlottedElements();
            this.#applyValue(this.value);
        });
        /* --- */
        this.#buttonEl.addEventListener("click", () => {
            if (!this.#isEditMode) {
                this.#startEditMode();
            }
        });
        this.#viewEl.addEventListener("click", () => {
            if (!this.#isEditMode) {
                this.#startEditMode();
            }
        });
        this.#inputEl.addEventListener("keydown", (event) => {
            if (!this.getBooleanAttribute("readonly")) {
                if (!this.#isEditMode) {
                    const {key} = event;
                    if (!BLACKLIST.includes(key) && !CONTROL_KEYS.includes(key)) {
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
            this.#cancelSelection();
            event.stopPropagation();
        });
        this.#inputEl.addEventListener("input", () => {
            const all = this.#optionNodeList.getNodeList();
            const regEx = new SearchLoose(this.#inputEl.value);
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
        }, {passive: true});
        /* --- */
        window.addEventListener("wheel", () => {
            if (this.#isEditMode) {
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
        this.value = this.getAttribute("value") || "";
        this.#resolveSlottedElements();
        if (!this.#value) {
            this.value = this.#optionNodeList.first?.value;
        }
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#viewEl.classList.toggle("disabled", disabled);
        this.#buttonEl.classList.toggle("disabled", disabled);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
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
                    this.#inputEl.setAttribute(name, newValue);
                }
            } break;
            case "placeholder": {
                if (oldValue != newValue) {
                    this.#placeholderEl.setAttribute("i18n-value", newValue)
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    this.#i18nEventManager.setActive(this.getBooleanAttribute("sorted"));
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
        this.#isEditMode = false;
        this.#inputEl.classList.remove("active");
        this.#viewEl.focus();
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
            value = el.innerHTML;
        }
        if (value !== "") {
            this.#viewEl.innerHTML = value;
        } else {
            this.#viewEl.innerHTML = "";
            this.#viewEl.append(this.#placeholderEl);
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
        this.#optionSelectEventManager.clearTargets();
        for (const el of optionNodeList) {
            this.#optionSelectEventManager.addTarget(el);
            if (el.value == this.value) {
                this.#inputEl.innerHTML = el.innerHTML;
            }
        }
        /* --- */
        if (this.getBooleanAttribute("sorted")) {
            this.#sort();
        }
    }

    setCustomValidity(message) {
        if (typeof message === "string" && message !== "") {
            this.internals.setValidity({customError: true}, message, this.#inputEl);
        } else {
            this.internals.setValidity({}, "");
        }
    }

}

customElements.define("emc-select-search", SearchSelect);
