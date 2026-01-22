import AbstractFormElement from "../../AbstractFormElement.js";
import ResizeObserverMixin from "../../../../mixin/ResizeObserverMixin.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import EventTargetManager from "../../../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../../../util/I18n.js";
import CharacterSearch from "../../../../../util/search/CharacterSearch.js";
import {deepClone} from "../../../../../util/helper/DeepClone.js";
import {nodeTextComparator} from "../../../../../util/helper/ui/NodeListSort.js";
import {debounce} from "../../../../../util/Debouncer.js";
import {registerFocusable} from "../../../../../util/helper/html/ElementFocusHelper.js";
import {
    safeSetAttribute, setAttributes
} from "../../../../../util/helper/ui/NodeAttributes.js";
import MutationObserverManager from "../../../../../util/observer/manager/MutationObserverManager.js";
import TokenSelectedElementManager from "./manager/TokenSelectedElementManager.js";
import I18nOption from "../../../../i18n/builtin/I18nOption.js";
import SelectEntryManager from "../../components/SelectEntryManager.js";
import I18nOptionManager from "../../components/I18nOptionManager.js";
import "../../../../i18n/builtin/I18nInput.js";
import "../../../../i18n/I18nLabel.js";
import TPL from "./TokenSelect.js.html" assert {type: "html"};
import STYLE from "./TokenSelect.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./TokenSelect.js.json" assert {type: "json"};
import jsonParse from "../../../../../patches/JSONParser.js";

const ESCAPE_KEYS = [
    "Tab",
    "Escape"
];

const MUTATION_CONFIG = {
    attributes: true,
    characterData: true,
    attributeFilter: ["value", "label"]
};

// TODO add manage token option (?)
// TODO add token usage detection (?)
export default class TokenSelect extends ResizeObserverMixin(AbstractFormElement) {

    static get formConfigurationFields() {
        return [...super.formConfigurationFields, ...deepClone(CONFIG_FIELDS)];
    }

    static get changeDebounceTime() {
        return 0;
    }

    #isEditMode = false;

    #fieldEl;

    #inputEl;

    #nativeSelectEl;

    #nativeEmptyEl;

    #viewEl;

    #valueEl;

    #tokenContainerEl;

    #overflowCounterEl;

    #buttonEl;

    #placeholderEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #emptyEl;

    #nomatchEl;

    #optionsSlotEl;

    #optionSelectEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n);

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, () => {
        this.#onSlotChange();
    });

    #tokenSelectedManager;

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
            const el = event.currentTarget;
            const value = el.getAttribute("value");
            this.#toggleToken(value, el);
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
        this.#tokenContainerEl = this.shadowRoot.getElementById("token-container");
        this.#overflowCounterEl = this.shadowRoot.getElementById("overflow-counter");
        this.#emptyEl = this.shadowRoot.getElementById("empty");
        this.#nomatchEl = this.shadowRoot.getElementById("nomatch");
        this.#placeholderEl = this.shadowRoot.getElementById("placeholder");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        this.#optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#optionsSlotEl = this.shadowRoot.getElementById("options-slot");
        this.registerTargetEventHandler(this.#optionsSlotEl, "slotchange", () => {
            this.#onSlotChange();
        });
        /* --- */
        this.registerTargetEventHandler(this.#scrollContainerEl, "mousedown", (event) => {
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#scrollContainerEl, "click", () => {
            this.focus();
        });
        /* --- */
        this.registerTargetEventHandler(this.#viewEl, "click", (event) => {
            if (!this.readonly && !this.#isEditMode) {
                this.#startEditMode();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.registerTargetEventHandler(this.#inputEl, "click", (event) => {
            if (!this.readonly && !this.#isEditMode) {
                this.#startEditMode();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.registerTargetEventHandler(this.#inputEl, "mousedown", (event) => {
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#inputEl, "keydown", (event) => {
            if (!this.getBooleanAttribute("readonly")) {
                if (!this.#isEditMode) {
                    const {key} = event;
                    if (key === "Enter") {
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
                    } else if (key === "Enter") {
                        this.#createToken();
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (key === " ") {
                        this.#toggleMarkedToken();
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
        this.registerTargetEventHandler(this.#inputEl, "blur", (event) => {
            if (event.relatedTarget != null && !event.relatedTarget.contains(this.#inputEl)) {
                this.#cancelSelection();
            }
            event.stopPropagation();
        });
        this.registerTargetEventHandler(this.#inputEl, "input", () => {
            if (!this.#isEditMode) {
                this.#startEditMode(true);
            }
            this.#applySearch();
        }, true);
        this.registerTargetEventHandler(this.#scrollContainerEl, "wheel", (event) => {
            event.stopPropagation();
        }, {passive: true});
        /* --- */
        this.registerTargetEventHandler(this.#nativeSelectEl, "mousedown", (event) => {
            if (this.readonly) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.registerTargetEventHandler(this.#nativeSelectEl, "change", () => {
            this.value = this.#nativeSelectEl.value;
        });
        /* --- */
        this.registerTargetEventHandler(window, "wheel", () => {
            if (this.#isEditMode) {
                this.#cancelSelection();
            }
        }, {passive: true});
        this.registerTargetEventHandler(window, "blur", () => {
            if (this.#isEditMode) {
                this.#cancelSelection();
            }
        }, {passive: true});
        this.registerTargetEventHandler(window, "mousedown", (event) => {
            if (!this.readonly && this.#isEditMode) {
                if (!this.#fieldEl.contains(event.target)) {
                    this.#cancelSelection();
                } else {
                    this.focus();
                }
            }
        }, {passive: true});
        /* --- */
        this.#tokenSelectedManager = new TokenSelectedElementManager(this.#tokenContainerEl);
        this.#tokenSelectedManager.registerSortFunction(this.#sortByNameFunction);
        this.registerTargetEventHandler(this.#tokenSelectedManager, "afterrender", () => {
            this.#handleOverflowItems();
        });
        this.#selectEntryManager = new SelectEntryManager(this.#optionsContainerEl, this.#optionSelectEventManager);
        this.#selectEntryManager.registerSortFunction(this.#sortByNameFunction);
        this.registerTargetEventHandler(this.#selectEntryManager, "afterrender", () => {
            this.#refreshSelect(this.#optionsContainerEl);
            this.renderValue(this.value);
        });
        this.#i18nOptionManager = new I18nOptionManager(this.#nativeSelectEl);
        this.#i18nOptionManager.registerSortFunction(this.#sortByNameFunction);
        this.registerTargetEventHandler(this.#i18nOptionManager, "afterrender", () => {
            this.#refreshSelect(this.#nativeSelectEl);
        });
        /* --- */
        this.#i18nEventManager.set("language", () => {
            this.#selectEntryManager.sort();
            this.#i18nOptionManager.sort();
            this.#tokenSelectedManager.sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#selectEntryManager.sort();
            this.#i18nOptionManager.sort();
            this.#tokenSelectedManager.sort();
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#tokenSelectedManager.setEventManagerActive(true);
        this.#onSlotChange();
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this.#tokenSelectedManager.setEventManagerActive(false);
    }

    resizeCallback() {
        this.#tokenSelectedManager.rerender();
        super.resizeCallback();
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#nativeSelectEl.disabled = disabled;
        this.#buttonEl.disabled = disabled;
    }

    focus(options) {
        super.focus(options);
        const mediaQuery = window.matchMedia("(hover: none)");
        if (mediaQuery.matches) {
            this.#nativeSelectEl.focus(options);
        } else {
            this.#inputEl.focus(options);
        }
    }

    set defaultValue(value) {
        this.setJSONAttribute("value", value);
    }

    get defaultValue() {
        return this.getJSONAttribute("value") ?? [];
    }

    set value(value) {
        if (value == null) {
            value = [];
        }
        if (typeof value === "string") {
            value = jsonParse(value);
        }
        if (!Array.isArray(value)) {
            throw new TypeError("value must be an array or null");
        }
        if (!this.chooseonly) {
            for (const v of value) {
                const el = this.#optionsContainerEl.querySelector(`[value="${v}"]`);
                if (el == null) {
                    const optionEl = I18nOption.create();
                    optionEl.value = v;
                    optionEl.i18nValue = v;
                    this.append(optionEl);
                }
            }
        } else {
            value = value.filter((v) => {
                const el = this.#optionsContainerEl.querySelector(`[value="${v}"]`);
                return el != null;
            });
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

    set placeholder(value) {
        this.setAttribute("placeholder", value);
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    set multiple(val) {
        this.setBooleanAttribute("multiple", val);
    }

    get multiple() {
        return this.getBooleanAttribute("multiple");
    }

    set chooseonly(value) {
        this.setBooleanAttribute("chooseonly", value);
    }

    get chooseonly() {
        return this.getBooleanAttribute("chooseonly");
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [...superObserved, "placeholder", "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
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
            case "multiple": {
                if (oldValue != newValue) {
                    if (!this.multiple) {
                        const value = this.value;
                        if (value.length > 1) {
                            this.value = [value[0]];
                        }
                    }
                }
            } break;
        }
    }

    renderValue(value) {
        if (value != null && value.length > 0) {
            const data = [];
            for (const val of value ?? []) {
                const selectedEl = this.#optionsContainerEl.querySelector(`[value="${val}"]`);
                if (selectedEl != null) {
                    data.push({
                        key: val,
                        label: selectedEl.label ?? selectedEl.innerText,
                        tokenAction: this.#tokenAction
                    });
                }
            }
            this.#valueEl.classList.remove("hidden");
            this.#placeholderEl.classList.add("hidden");
            this.#tokenSelectedManager.manage(data);
        } else {
            this.#nativeSelectEl.value = "";
            this.#tokenContainerEl.innerHTML = "";
            this.#valueEl.classList.add("hidden");
            this.#placeholderEl.classList.remove("hidden");
        }
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
            const value = this.value;
            for (const el of all) {
                el.style.display = "";
                if (value != null && value.includes(el.value)) {
                    el.selected = true;
                } else {
                    el.selected = false;
                }
            }
        }
    }

    #createToken() {
        const value = this.#inputEl.value;
        this.#inputEl.value = "";
        this.#nomatchEl.style.display = "";
        if (value != null && value !== "") {
            const valueBuffer = new Set(this.value);
            if (this.chooseonly) {
                const el = this.#optionsContainerEl.querySelector(`[value="${value}"]`);
                if (el != null) {
                    if (this.multiple) {
                        valueBuffer.add(value);
                    } else {
                        valueBuffer.clear();
                        valueBuffer.add(value);
                    }
                }
            } else if (this.multiple) {
                valueBuffer.add(value);
            } else {
                valueBuffer.clear();
                valueBuffer.add(value);
            }
            this.value = Array.from(valueBuffer);
        }
        this.#applySearch();
        this.focus();
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
        }
        this.#tokenSelectedManager.rerender();
    }

    #handleOverflowItems() {
        const els = [...this.#tokenContainerEl.children];
        let overflowItems = 0;
        this.#overflowCounterEl.innerText = "";
        for (let i = 0; i < els.length; ++i) {
            const el = els[i];
            if (el != null) {
                const containerWidth = this.#tokenContainerEl.clientWidth;
                const elLeft = el.offsetLeft;
                const elWidth = el.offsetWidth;
                const elRight = elLeft + elWidth;
                if (elRight > containerWidth) {
                    el.remove();
                    overflowItems++;
                    i -= 2;
                    this.#overflowCounterEl.innerText = `+${overflowItems}`;
                }
            }
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
            nextEl = this.#optionsContainerEl.querySelector(`[value="${this.value ?? ""}"]`);
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

    #tokenAction = (event) => {
        const el = event.currentTarget;
        if (el != null) {
            const value = el.dataset.value;
            this.#toggleToken(value, el);
        }
        event.stopPropagation();
    };

    #toggleMarkedToken() {
        const el = this.#optionsContainerEl.querySelector(".marked");
        if (el != null) {
            const value = el.getAttribute("value");
            this.#toggleToken(value, el);
        }
    }

    #toggleToken(value, toggledEl) {
        if (!this.readonly) {
            const valueBuffer = new Set(this.value);
            if (this.multiple) {
                if (valueBuffer.has(value)) {
                    valueBuffer.delete(value);
                    toggledEl.selected = false;
                } else {
                    valueBuffer.add(value);
                    toggledEl.selected = true;
                }
            } else if (valueBuffer.has(value)) {
                valueBuffer.delete(value);
                toggledEl.selected = false;
            } else {
                valueBuffer.clear();
                valueBuffer.add(value);
                const currentEls = this.#optionsContainerEl.querySelectorAll("[selected]:not([selected=false])");
                for (const el of currentEls) {
                    el.selected = false;
                }
                toggledEl.selected = true;
            }
            this.value = Array.from(valueBuffer);
        }
    }

    #sortByNameFunction(entry0, entry1) {
        const {element: el0} = entry0;
        const {element: el1} = entry1;
        return nodeTextComparator(el0, el1);
    }

    #refreshSelect(containerEl) {
        const all = containerEl.querySelectorAll(`[value]`);
        const value = this.value;
        for (const el of all) {
            el.style.display = "";
            if (value != null && value.includes(el.value)) {
                el.selected = true;
            } else {
                el.selected = false;
            }
        }
    }

    #applySearch = debounce(() => {
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
    }, AbstractFormElement.changeDebounceTime);

    static fromConfig(config) {
        const selectEl = new TokenSelect();
        const {
            options = {}, ...params
        } = config;

        setAttributes(selectEl, params);

        for (const key in options) {
            const value = options[key];
            const optionEl = I18nOption.create();
            optionEl.value = key;
            if (value) {
                optionEl.i18nValue = value;
            }
            selectEl.append(optionEl);
        }

        return selectEl;
    }

}

FormElementRegistry.register("TokenSelect", TokenSelect);
customElements.define("emc-select-token", TokenSelect);
registerFocusable("emc-select-token");
