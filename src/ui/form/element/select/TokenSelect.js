import CustomFormElementDelegating from "../../../element/CustomFormElementDelegating.js";
import TokenRegistry from "../../../../data/registry/TokenRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../../util/I18n.js";
import CharacterSearch from "../../../../util/search/CharacterSearch.js";
import {
    sortNodeList
} from "../../../../util/helper/ui/NodeListSort.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import Comparator, {
    isEqual
} from "../../../../util/helper/Comparator.js";
import ElementListCache from "../../../../util/html/ElementListCache.js";
import ElementManager from "../../../../util/html/ElementManager.js";
import "../../../i18n/builtin/I18nOption.js";
import TPL from "./TokenSelect.js.html" assert {type: "html"};
import STYLE from "./TokenSelect.js.css" assert {type: "css"};

const ESCAPE_KEYS = [
    "Tab",
    "Escape"
];

class TokenElementManager extends ElementManager {

    composer(key, params) {
        const el = document.createElement("div");
        el.className = "token";
        el.innerHTML = key;
        el.dataset.value = key;
        el.addEventListener("click", (event) => {
            params.tokenAction(event);
        });
        return el;
    }

}

// TODO add manage token option (?)
// TODO add token usage detection (?)

export default class TokenSelect extends CustomFormElementDelegating {

    #tokenRegistry = null;

    #tokenRegistryEventTargetManager = new EventTargetManager();

    #isEditMode = false;

    #value;

    #inputEl;

    #viewEl;

    #valueEl;

    #buttonEl;

    #placeholderEl;

    #scrollContainerEl;

    #optionsContainerEl;

    #elManager;

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager = new EventMultiTargetManager();

    #i18nEventManager = new EventTargetManager(i18n);

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
            const el = event.currentTarget;
            el.classList.toggle("selected");
            const value = el.getAttribute("value");
            this.#toggleToken(value, el);
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
        this.#elManager = new TokenElementManager(this.#valueEl);
        /* --- */
        this.#tokenRegistryEventTargetManager.set("change", () => {
            this.#loadTokenFromGroup();
        });
        /* --- */
        this.#i18nEventManager.set("language", () => {
            this.#sort();
        });
        this.#i18nEventManager.set("translation", () => {
            this.#sort();
        });
    }

    connectedCallback() {
        const value = this.value;
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
        this.value = this.getAttribute("value") || "";
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    set value(value) {
        if (!isEqual(this.#value, value)) {
            if (value == null || value === "") {
                value = [];
            } else if (!Array.isArray(value)) {
                value = [value];
            } else {
                value = [...value]
            }
            if (!this.chooseonly && this.#tokenRegistry != null) {
                for (const token of value) {
                    this.#tokenRegistry.add(token)
                }
            }
            this.#value = value;
            this.#applyValue(value);
            this.internals.setFormValue(JSON.stringify(value));
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        if (this.#value != null) {
            return this.#value;
        }
        try {
            const value = JSON.parse(this.getAttribute("value"));
            if (!Array.isArray(value)) {
                return [value];
            }
            return value;
        } catch {
            return [];
        }
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

    set multiple(value) {
        this.setBooleanAttribute("multiple", value);
    }

    get multiple() {
        return this.getBooleanAttribute("multiple");
    }

    set tokengroup(value) {
        this.setAttribute("tokengroup", value);
    }

    get tokengroup() {
        return this.getAttribute("tokengroup");
    }

    set chooseonly(value) {
        this.setBooleanAttribute("chooseonly", value);
    }

    get chooseonly() {
        return this.getBooleanAttribute("chooseonly");
    }

    static get observedAttributes() {
        return ["value", "placeholder", "multiple", "tokengroup"];
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
            case "tokengroup": {
                if (oldValue != newValue) {
                    if (newValue == null || newValue === "") {
                        this.#tokenRegistry = null;
                    } else {
                        this.#tokenRegistry = new TokenRegistry(newValue);
                    }
                    this.#tokenRegistryEventTargetManager.switchTarget(this.#tokenRegistry);
                    this.#loadTokenFromGroup();
                }
            } break;
        }
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
            const all = this.#optionNodeList.querySelectorAll(`[value]`);
            const valueBuffer = new Set(this.value);
            for (const el of all) {
                el.style.display = "";
                if (valueBuffer.has(el.value)) {
                    el.classList.add("selected");
                } else {
                    el.classList.remove("selected");
                }
            }
        }
    }

    #createToken() {
        const value = this.#inputEl.value;
        if (value != null && value !== "") {
            const valueBuffer = new Set(this.value);
            if (this.chooseonly) {
                const el = this.#optionNodeList.querySelector(`[value="${value}"]`);
                if (el != null) {
                    if (this.multiple) {
                        valueBuffer.add(value);
                    } else {
                        valueBuffer.clear();
                        valueBuffer.add(value);
                    }
                }
            } else {
                if (this.#tokenRegistry != null) {
                    this.#tokenRegistry.add(value)
                }
                if (this.multiple) {
                    valueBuffer.add(value);
                } else {
                    valueBuffer.clear();
                    valueBuffer.add(value);
                }
            }
            this.value = Array.from(valueBuffer);
            this.#applyValue(this.value);
        }
        this.focus();
        this.#stopEditMode();
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
        }
        this.#applyValue(this.value);
    }

    #applyValue(value) {
        const data = [];
        for (const val of value) {
            data.push({
                key: val,
                tokenAction: this.#tokenAction
            });
        }
        this.#elManager.manage(data);
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
        this.#optionSelectEventManager.clearTargets();
        for (const el of optionNodeList) {
            this.#optionSelectEventManager.addTarget(el);
        }
        /* --- */
        this.#sort();
        this.#applyValue(this.#value);
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
    }

    #toggleMarkedToken() {
        const el = this.#optionNodeList.querySelector(".marked");
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
                    toggledEl.classList.remove("selected");
                } else {
                    valueBuffer.add(value);
                    toggledEl.classList.add("selected");
                }
            } else if (valueBuffer.has(value)) {
                valueBuffer.delete(value);
                toggledEl.classList.remove("selected");
            } else {
                valueBuffer.clear();
                valueBuffer.add(value);
                const currentEls = this.#optionNodeList.querySelectorAll(".selected");
                for (const el of currentEls) {
                    el.classList.remove("selected");
                }
                toggledEl.classList.add("selected");
            }
            this.value = Array.from(valueBuffer);
            this.#applyValue(this.value);
        }
    }

    #loadTokenFromGroup() {
        this.innerHTML = "";
        if (this.#tokenRegistry != null) {
            for (const value of this.#tokenRegistry) {
                const optionEl = document.createElement("option");
                optionEl.setAttribute("value", value);
                optionEl.innerHTML = value;
                this.append(optionEl);
            }
        }
    }

}

customElements.define("emc-select-token", TokenSelect);
