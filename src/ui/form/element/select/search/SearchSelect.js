import AbstractFormElement from "../../AbstractFormElement.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../../../util/I18n.js";
import CharacterSearch from "../../../../../util/search/CharacterSearch.js";
import {
    deepClone
} from "../../../../../util/helper/DeepClone.js";
import {
    nodeTextComparator
} from "../../../../../util/helper/ui/NodeListSort.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import MutationObserverManager from "../../../../../util/observer/MutationObserverManager.js";
import I18nOption from "../../../../i18n/builtin/I18nOption.js";
import SelectEntryManager from "../../components/SelectEntryManager.js";
import I18nOptionManager from "../../components/I18nOptionManager.js";
import "../../../../i18n/builtin/I18nInput.js";
import "../../../../i18n/I18nLabel.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./SearchSelect.js.json" assert {type: "json"};

const ESCAPE_KEYS = [
    "Tab",
    "Escape",
    "Enter"
];

const MUTATION_CONFIG = {
    attributes: true,
    characterData: true,
    attributeFilter: ["value", "label"]
};

export default class SearchSelect extends AbstractFormElement {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    #isEditMode = false;

    #fieldEl;

    #inputEl;

    #nativeSelectEl;

    #nativeEmptyEl;

    #viewEl;

    #valueEl;

    #buttonEl;

    #placeholderEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #emptyEl;

    #nomatchEl;

    #optionsSlotEl;

    #optionSelectEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n, false);

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    #selectEntryManager;

    #i18nOptionManager;

    constructor() {
        super();
        this.#fieldEl = this.shadowRoot.getElementById("field");
        this.#fieldEl.append(TPL.generate());
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
            const marked = this.#optionsContainerEl.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#nativeSelectEl = this.shadowRoot.getElementById("native-select");
        this.#nativeEmptyEl = this.shadowRoot.getElementById("native-empty");
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#emptyEl = this.shadowRoot.getElementById("empty");
        this.#nomatchEl = this.shadowRoot.getElementById("nomatch");
        this.#placeholderEl = this.shadowRoot.getElementById("placeholder");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsSlotEl = this.shadowRoot.getElementById("options-slot");
        this.#optionsSlotEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.#scrollContainerEl.addEventListener("mousedown", (event) => {
            event.stopPropagation();
        });
        this.#scrollContainerEl.addEventListener("click", () => {
            this.focus();
        });
        /* --- */
        this.#viewEl.addEventListener("click", (event) => {
            if (!this.readonly && !this.#isEditMode) {
                this.#startEditMode();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.#inputEl.addEventListener("click", (event) => {
            if (!this.readonly && !this.#isEditMode) {
                this.#startEditMode();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.#inputEl.addEventListener("mousedown", (event) => {
            event.stopPropagation();
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
            if (!this.#isEditMode) {
                this.#startEditMode(true);
            }
            const all = this.#optionsContainerEl.children;
            const regEx = new CharacterSearch(this.#inputEl.value);
            const elCount = all.length;
            if (elCount > 0) {
                let hiddenCount = 0;
                for (const el of all) {
                    const testText = el.comparatorText ?? el.innerText;
                    if (regEx.test(testText.trim())) {
                        el.style.display = "";
                    } else {
                        el.style.display = "none";
                        hiddenCount++;
                    }
                }
                if (elCount <= hiddenCount) {
                    this.#nomatchEl.style.display = "flex";
                } else {
                    this.#nomatchEl.style.display = "";
                }
            }
        }, true);
        this.#scrollContainerEl.addEventListener("wheel", (event) => {
            event.stopPropagation();
        }, {passive: true});
        /* --- */
        this.#nativeSelectEl.addEventListener("mousedown", (event) => {
            if (this.readonly) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.#nativeSelectEl.addEventListener("change", () => {
            this.value = this.#nativeSelectEl.value;
        });
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
            if (!this.readonly && this.#isEditMode) {
                if (!this.#fieldEl.contains(event.target)) {
                    this.#cancelSelection();
                } else {
                    this.focus();
                }
            }
        }, {passive: true});
        /* --- */
        this.#selectEntryManager = new SelectEntryManager(this.#optionsContainerEl, this.#optionSelectEventManager);
        this.#selectEntryManager.addEventListener("afterrender", () => {
            this.#refreshSelect(this.#optionsContainerEl);
            this.renderValue(this.value);
        });
        this.#i18nOptionManager = new I18nOptionManager(this.#nativeSelectEl);
        this.#i18nOptionManager.addEventListener("afterrender", () => {
            this.#refreshSelect(this.#nativeSelectEl);
        });
        /* --- */
        this.#i18nEventManager.set("language", () => {
            this.#selectEntryManager.sort();
            this.#i18nOptionManager.sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#selectEntryManager.sort();
            this.#i18nOptionManager.sort();
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#nativeSelectEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
    }

    focus(options) {
        const mediaQuery = window.matchMedia("(hover: none)");
        if (mediaQuery.matches) {
            this.#nativeSelectEl.focus(options);
        } else {
            this.#inputEl.focus(options);
        }
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
        return [...super.observedAttributes, "placeholder", "readonly", "sorted"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "placeholder": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#placeholderEl, "i18n-value", newValue);
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", newValue);
                    safeSetAttribute(this.#buttonEl, "readonly", newValue);
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    const sorted = this.sorted;
                    this.#i18nEventManager.active = sorted;
                    if (sorted) {
                        this.#selectEntryManager.registerSortFunction(this.#sortByNameFunction);
                        this.#i18nOptionManager.registerSortFunction(this.#sortByNameFunction);
                    } else {
                        this.#selectEntryManager.registerSortFunction();
                        this.#i18nOptionManager.registerSortFunction();
                    }
                }
            } break;
        }
    }

    renderValue(value) {
        if (value != null && value !== "") {
            this.#nativeSelectEl.value = value;
            const selectedEl = this.#optionsContainerEl.querySelector(`[value="${value}"]`);
            if (selectedEl != null) {
                if (selectedEl.label != null) {
                    this.#valueEl.i18nValue = selectedEl.label;
                } else {
                    this.#valueEl.i18nValue = "";
                    this.#valueEl.innerText = selectedEl.innerText;
                }
            } else {
                this.#valueEl.i18nValue = value;
            }
            this.#valueEl.classList.remove("hidden");
            this.#placeholderEl.classList.add("hidden");
        } else {
            this.#nativeSelectEl.value = "";
            this.#valueEl.i18nValue = "";
            this.#valueEl.innerHTML = "";
            this.#valueEl.classList.add("hidden");
            this.#placeholderEl.classList.remove("hidden");
        }
    }

    #choose(value) {
        if (!this.getBooleanAttribute("readonly")) {
            this.value = value;
            this.focus();
        }
        this.#stopEditMode();
    }

    #cancelSelection() {
        this.renderValue(this.value);
        this.#stopEditMode();
    }

    #startEditMode(keepSearchInput = false) {
        if (!this.readonly) {
            this.#isEditMode = true;
            if (!keepSearchInput) {
                this.#inputEl.value = "";
            }
            this.#inputEl.classList.add("active");
            this.focus();
            /* --- */
            const thisRect = this.#fieldEl.getBoundingClientRect();
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
            const all = this.#optionsContainerEl.querySelectorAll(`[value]`);
            for (const el of all) {
                el.style.display = "";
                if (el.value === this.value) {
                    el.selected = true;
                } else {
                    el.selected = false;
                }
            }
        }
    }

    #stopEditMode() {
        this.#isEditMode = false;
        this.#inputEl.classList.remove("active");
        this.#inputEl.value = "";
        this.#nomatchEl.style.display = "";
        /* --- */
        this.#scrollContainerEl.style.display = "";
        this.#scrollContainerEl.style.bottom = "";
        this.#scrollContainerEl.style.top = "";
        this.#scrollContainerEl.style.zIndex = "";
        const all = this.querySelectorAll(`[value]`);
        for (const el of all) {
            el.style.display = "";
        }
        const marked = this.#optionsContainerEl.querySelector(".marked");
        if (marked != null) {
            marked.classList.remove("marked");
            this.value = marked.value;
        } else {
            this.renderValue(this.value);
        }
    }

    #switchSelected(modeUp = false) {
        const marked = this.#optionsContainerEl.querySelector(`[value="${this.value}"]`);
        const el = this.#switchOption(marked, modeUp);
        if (el != null) {
            this.value = el.value;
        }
    }

    #moveMarker(modeUp = false) {
        const marked = this.#optionsContainerEl.querySelector(".marked");
        const el = this.#switchOption(marked, modeUp);
        if (el != null) {
            if (marked != null) {
                marked.classList.remove("marked");
            }
            el.classList.add("marked");
            const scrollOffset = this.#scrollContainerEl.offsetTop;
            const scrollHeight = this.#scrollContainerEl.offsetHeight;
            const targetOffset = el.offsetTop - scrollOffset;
            const targetHeight = el.offsetHeight;
            if (this.#scrollContainerEl.scrollTop > targetOffset - 20) {
                this.#scrollContainerEl.scrollTop = targetOffset - 20;
            } else if (this.#scrollContainerEl.scrollTop < targetOffset + targetHeight - (scrollHeight - 20)) {
                this.#scrollContainerEl.scrollTop = targetOffset + targetHeight - (scrollHeight - 20);
            }
        }
    }

    #switchOption(oldEl, modeUp = false) {
        let nextEl;
        if (oldEl != null) {
            if (modeUp) {
                nextEl = this.#getPrevOption(oldEl);
                if (nextEl == null && oldEl.style.display === "none") {
                    nextEl = this.#getNextOption(oldEl);
                }
            } else {
                nextEl = this.#getNextOption(oldEl);
                if (nextEl == null && oldEl.style.display === "none") {
                    nextEl = this.#getPrevOption(oldEl);
                }
            }
        } else {
            nextEl = this.#optionsContainerEl.querySelector(`[value="${this.value}"]`);
            if (nextEl == null || nextEl.style.display === "none") {
                nextEl = this.#getFirstOption();
            }
        }
        return nextEl;
    }

    #getFirstOption() {
        let nextEl = this.#optionsContainerEl.firstElementChild;
        while (nextEl != null && (nextEl.style.display === "none" || !nextEl.matches("[value]"))) {
            nextEl = nextEl.nextElementSibling;
        }
        if (nextEl != null && nextEl.style.display !== "none" && nextEl.matches("[value]")) {
            return nextEl;
        }
    }

    #getPrevOption(oldEl) {
        let nextEl = oldEl.previousElementSibling;
        while (nextEl != null && (nextEl.style.display === "none" || !nextEl.matches("[value]"))) {
            nextEl = nextEl.previousElementSibling;
        }
        if (nextEl != null && nextEl.style.display !== "none" && nextEl.matches("[value]")) {
            return nextEl;
        }
    }

    #getNextOption(oldEl) {
        let nextEl = oldEl.nextElementSibling;
        while (nextEl != null && (nextEl.style.display === "none" || !nextEl.matches("[value]"))) {
            nextEl = nextEl.nextElementSibling;
        }
        if (nextEl != null && nextEl.style.display !== "none" && nextEl.matches("[value]")) {
            return nextEl;
        }
    }

    async #resolveSlottedElements() {
        await BusyIndicatorManager.busy();
        const data = [];
        const optionNodeList = this.#optionsSlotEl.assignedElements({flatten: true}).filter((el) => el.matches("option"));
        /* --- */
        const oldNodes = new Set(this.#mutationObserver.getObservedNodes());
        const newNodes = new Set();
        for (const el of optionNodeList) {
            data.push({
                key: el.value || el.innerText,
                label: el.i18nValue || el.label || el.innerText
            });
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
        this.#selectEntryManager.manage(data);
        this.#i18nOptionManager.manage(data);
        /* --- */
        if (newNodes.size > 0) {
            this.#emptyEl.style.display = "";
            this.#nativeEmptyEl.remove();
        } else if (this.#nativeSelectEl.children.length <= 0) {
            this.#emptyEl.style.display = "flex";
            this.#nativeSelectEl.append(this.#nativeEmptyEl);
        }
        /* --- */
        this.renderValue(this.value);
        await BusyIndicatorManager.unbusy();
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

    #sortByNameFunction(entry0, entry1) {
        const {element: el0} = entry0;
        const {element: el1} = entry1;
        return nodeTextComparator(el0, el1);
    }

    #refreshSelect(containerEl) {
        const selectedEl = containerEl.querySelector("[selected]:not([selected=\"false\"])");
        if (selectedEl != null) {
            selectedEl.selected = false;
        }
        const matchingEl = containerEl.querySelector(`[value="${this.value}"]`);
        if (matchingEl != null) {
            matchingEl.selected = true;
        }
    }

    static fromConfig(config) {
        const selectEl = new SearchSelect();
        const {options = {}, ...params} = config;

        for (const value in options) {
            const optionEl = I18nOption.create();
            optionEl.value = value;
            const label = options[value];
            if (typeof label === "string" && label !== "") {
                optionEl.i18nValue = label;
            } else if (value !== "") {
                optionEl.i18nValue = value;
            }
            selectEl.append(optionEl);
        }

        for (const name in params) {
            const value = params[name];
            safeSetAttribute(selectEl, name, value);
        }

        return selectEl;
    }

}

FormElementRegistry.register("SearchSelect", SearchSelect);
customElements.define("emc-select-search", SearchSelect);
registerFocusable("emc-select-search");
