import CustomFormElementDelegating from "../../../../element/CustomFormElementDelegating.js";
import BusyIndicatorManager from "../../../../../util/BusyIndicatorManager.js";
import TypeStorage from "../../../../../data/type/TypeStorage.js";
import EventMultiTargetManager from "../../../../../util/event/EventMultiTargetManager.js";
import CharacterSearch from "../../../../../util/search/CharacterSearch.js";
import {
    sortNodeList
} from "../../../../../util/helper/ui/NodeListSort.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import {
    isEqual
} from "../../../../../util/helper/Comparator.js";
import ElementListCache from "../../../../../util/html/ElementListCache.js";
import "../../../../i18n/builtin/I18nInput.js";
import "./components/RelationSelectEntry.js";
import TPL from "./RelationSelect.js.html" assert {type: "html"};
import STYLE from "./RelationSelect.js.css" assert {type: "css"};

const ESCAPE_KEYS = [
    "Tab",
    "Escape",
    "Enter"
];

export default class RelationSelect extends CustomFormElementDelegating {

    #isEditMode = false;

    #value;

    #typesWildcarded = false;

    #inputEl;

    #viewEl;

    #valueEl;

    #nameEl;

    #typeEl;

    #buttonEl;

    #placeholderEl;

    #emptyEl = document.createElement("emc-select-relation-entry");

    #scrollContainerEl;

    #typeStorageEventManager = new EventMultiTargetManager();

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager = new EventMultiTargetManager();

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
            this.#choose(event.currentTarget.value);
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
        this.#typeStorageEventManager.set("clear", () => {
            this.#fillSelectElements();
        });
        this.#typeStorageEventManager.set("load", () => {
            this.#fillSelectElements();
        });
        this.#typeStorageEventManager.set("change", () => {
            this.#fillSelectElements();
        });
        /* --- */
        this.#emptyEl.name = "";
        this.#emptyEl.type = "";
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#valueEl = this.shadowRoot.getElementById("value");
        this.#nameEl = this.shadowRoot.getElementById("name");
        this.#typeEl = this.shadowRoot.getElementById("type");
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#placeholderEl = this.shadowRoot.getElementById("placeholder");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#buttonEl = this.shadowRoot.getElementById("button");
        /* --- */
        this.#scrollContainerEl.addEventListener("mousedown", (event) => {
            event.stopPropagation();
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
        TypeStorage.onStorageRegister((typeNames) => {
            this.#fillAfterStorageRegister(typeNames);
        });
        this.#fillSelectElements();
    }

    connectedCallback() {
        const value = this.value ?? this.defaultValue;
        this.#value = value;
        this.#applyValue(value);
        this.internals.setFormValue(value);
        this.#typesWildcarded = this.types.includes("*");
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
        if (value != null) {
            value = {
                type: value.type,
                name: value.name
            };
            if (typeof value.type !== "string" || typeof value.name !== "string" || value.type === "" || value.name === "") {
                value = null;
            }
        }
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

    get defaultValue() {
        let value = this.getJSONAttribute("types");
        if (value != null) {
            value = {
                type: value.type,
                name: value.name
            };
            if (typeof value.type !== "string" || typeof value.name !== "string") {
                value = null;
            }
        }
        return value;
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

    set types(value) {
        if (!Array.isArray(value)) {
            value = [];
        }
        this.setJSONAttribute("types", value);
    }

    get types() {
        const value = this.getJSONAttribute("types");
        if (!Array.isArray(value)) {
            return [];
        }
        return value;
    }

    static get observedAttributes() {
        return ["value", "placeholder", "sorted", "types"];
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
                    this.#placeholderEl.setAttribute("i18n-value", newValue);
                }
            } break;
            case "sorted": {
                if (oldValue != newValue) {
                    const sorted = this.sorted;
                    if (sorted) {
                        this.#sort();
                    }
                }
            } break;
            case "types": {
                if (oldValue != newValue) {
                    this.#typesWildcarded = this.types.includes("*");
                    this.#fillSelectElements();
                }
            } break;
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
            for (const el of this.#optionNodeList) {
                el.style.display = "";
                if (el.value?.type === this.#value?.type && el.value?.name === this.#value?.name) {
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
        const all = this.querySelectorAll(`emc-select-relation-entry`);
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
            const selectedEl = this.#optionNodeList.querySelector(`[type="${value.type}"][name="${value.name}"]`);
            if (selectedEl != null) {
                this.#nameEl.innerText = selectedEl.name;
                this.#typeEl.innerText = selectedEl.type;
            } else {
                this.#nameEl.innerText = "";
                this.#typeEl.innerText = "";
            }
            this.#valueEl.classList.remove("hidden");
            this.#placeholderEl.classList.add("hidden");
        } else {
            this.#nameEl.innerText = "";
            this.#typeEl.innerText = "";
            this.#valueEl.classList.add("hidden");
            this.#placeholderEl.classList.remove("hidden");
        }
    }

    #switchSelected(modeUp = false) {
        const value = this.#value;
        const currentEl = this.#optionNodeList.querySelector(`[type="${value?.type ?? ""}"][name="${value?.name ?? ""}"]`);
        const el = this.#switchOption(currentEl, modeUp);
        if (el != null) {
            this.value = el.value;
        }
    }

    #moveMarker(modeUp = false) {
        const markedEl = this.#optionNodeList.querySelector(".marked");
        const el = this.#switchOption(markedEl, modeUp);
        if (el != null) {
            if (markedEl != null) {
                markedEl.classList.remove("marked");
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
            const value = this.#value;
            nextEl = this.#optionNodeList.querySelector(`[type="${value?.type ?? ""}"][name="${value?.name ?? ""}"]`);
            if (nextEl == null) {
                nextEl = this.#getFirstOption();
            }
        }
        return nextEl;
    }

    #getFirstOption() {
        let nextEl = this.#optionNodeList.first;
        while (nextEl != null && (nextEl.style.display == "none" || !nextEl.matches("emc-select-relation-entry"))) {
            nextEl = this.#optionNodeList.getNext(nextEl);
        }
        if (nextEl != null && nextEl.style.display != "none" && nextEl.matches("emc-select-relation-entry")) {
            return nextEl;
        }
    }

    #getPrevOption(oldEl) {
        let nextEl = this.#optionNodeList.getPrev(oldEl);
        while (nextEl != null && (nextEl.style.display == "none" || !nextEl.matches("emc-select-relation-entry"))) {
            nextEl = this.#optionNodeList.getPrev(nextEl);
        }
        if (nextEl != null && nextEl.style.display != "none" && nextEl.matches("emc-select-relation-entry")) {
            return nextEl;
        }
    }

    #getNextOption(oldEl) {
        let nextEl = this.#optionNodeList.getNext(oldEl);
        while (nextEl != null && (nextEl.style.display == "none" || !nextEl.matches("emc-select-relation-entry"))) {
            nextEl = this.#optionNodeList.getNext(nextEl);
        }
        if (nextEl != null && nextEl.style.display != "none" && nextEl.matches("emc-select-relation-entry")) {
            return nextEl;
        }
    }

    #sort = debounce(() => {
        const optionNodeList = this.#optionNodeList.getNodeList();
        const sortedNodeList = sortNodeList(optionNodeList);
        if (!isEqual(optionNodeList, sortedNodeList)) {
            for (const el of sortedNodeList) {
                this.append(el);
            }
        }
        this.#optionNodeList.setNodeList(sortedNodeList);
    });

    async #fillSelectElements() {
        await BusyIndicatorManager.busy();
        this.innerHTML = "";
        this.#optionNodeList.purge();
        this.#optionSelectEventManager.clearTargets();
        /* --- */
        if (this.#typesWildcarded) {
            const allTypes = TypeStorage.getAllStorageNames();
            for (const acceptedType of allTypes) {
                const storage = TypeStorage.getStorage(acceptedType);
                if (storage != null) {
                    this.#typeStorageEventManager.addTarget(storage);
                    for (const name of storage.keys()) {
                        const el = document.createElement("emc-select-relation-entry");
                        el.name = name;
                        el.type = acceptedType;
                        this.#optionNodeList.append(el);
                        this.#optionSelectEventManager.addTarget(el);
                        this.append(el);
                    }
                }
            }
        } else {
            const acceptedTypes = this.types;
            for (const acceptedType of acceptedTypes) {
                const storage = TypeStorage.getStorage(acceptedType);
                if (storage != null) {
                    this.#typeStorageEventManager.addTarget(storage);
                    for (const name of storage.keys()) {
                        const el = document.createElement("emc-select-relation-entry");
                        el.name = name;
                        el.type = acceptedType;
                        this.#optionNodeList.append(el);
                        this.#optionSelectEventManager.addTarget(el);
                        this.append(el);
                    }
                }
            }
        }
        /* --- */
        if (this.#optionNodeList.size > 0) {
            this.#optionNodeList.prepend(this.#emptyEl);
            this.#optionSelectEventManager.addTarget(this.#emptyEl);
            this.prepend(this.#emptyEl);
        }
        /* --- */
        /* --- */
        if (this.sorted) {
            this.#sort();
        }
        this.#applyValue(this.#value);
        await BusyIndicatorManager.unbusy();
    }

    #fillAfterStorageRegister(typeNames) {
        if (this.#typesWildcarded) {
            this.#fillSelectElements();
        } else {
            const acceptedTypes = this.types;
            for (const type of typeNames) {
                if (acceptedTypes.includes(type)) {
                    this.#fillSelectElements();
                    break;
                }
            }
        }
    }

}

customElements.define("emc-select-relation", RelationSelect);
