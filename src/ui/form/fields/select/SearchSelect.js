import "../../../element/FocusKeeper.js";
import AbstractFormInput from "../../abstract/AbstractFormInput.js";
import FormElementRegistry from "../../../../data/registry/FormElementRegistry.js";
import EventTargetManager from "../../../../util/event/EventTargetManager.js";
import EventMultiTargetManager from "../../../../util/event/EventMultiTargetManager.js";
import i18n from "../../../../util/I18n.js";
import SearchAnd from "../../../../util/search/SearchAnd.js";
import {
    sortChildrenByText
} from "../../../../util/helper/ui/sortNodeList.js";
import {
    debounce
} from "../../../../util/Debouncer.js";
import "./Option.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};

/*
    TODO remove view element - make everything work with just the input
    TODO integrate as form control
*/
export default class SearchSelect extends AbstractFormInput {

    #isEditMode = false;

    #value = "";

    #inputEl;

    #scrollContainerEl;

    #optionSelectEventManager;

    #slotEventManager;

    #i18nEventManager = new EventTargetManager(i18n);

    constructor() {
        super();
        this.shadowRoot.getElementById("field").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#optionSelectEventManager = new EventMultiTargetManager();
        this.#optionSelectEventManager.set("click", (event) => {
            this.#choose(event.currentTarget.getAttribute("value"));
            event.stopPropagation();
            return false;
        });
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        const buttonEl = this.shadowRoot.getElementById("button");
        const optionsContainerEl = this.shadowRoot.getElementById("options-container");
        this.#slotEventManager = new EventTargetManager(optionsContainerEl);
        this.#slotEventManager.set("slotchange", () => {
            this.#optionSelectEventManager.clearTargets();
            const all = this.querySelectorAll(`[value]`);
            for (const el of all) {
                this.#optionSelectEventManager.addTarget(el);
                if (el.value == this.value) {
                    this.#inputEl.innerHTML = el.innerHTML;
                }
            }
            if (this.getBooleanAttribute("sort")) {
                this.#sort();
            }
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
                            this.#moveSelection(true);
                            this.#applyValue(this.#value);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        case "ArrowDown": {
                            this.#moveSelection(false);
                            this.#applyValue(this.#value);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        case "Enter": {
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
        this.shadowRoot.getElementById("focus-keeper").addEventListener("focusout", (event) => {
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
                    el.classList.remove("marked");
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
        window.addEventListener("click", (event) => {
            if (this.#isEditMode) {
                this.#cancelSelection();
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        this.addEventListener("click", (event) => {
            event.stopPropagation();
            return false;
        });
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
        const all = this.querySelectorAll(`[value]`);
        if (!this.value && !!all.length) {
            this.value = all[0].value;
        }
        this.#optionSelectEventManager.clearTargets();
        for (const el of all) {
            this.#optionSelectEventManager.addTarget(el);
        }
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    #onInput = debounce(() => {
        super.value = this.#value;
    }, 300);

    set value(value) {
        this.#value = value;
        this.#applyValue(value);
        super.value = value;
    }

    get value() {
        return this.#value;
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder", "sort"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
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
                this.#applyValue(value);
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
        // TODO remove readonly from input
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
            const el = this.querySelector(`[value="${this.#value}"]`);
            if (el != null) {
                el.classList.add("marked");
            }
        }
    }

    #stopEditMode() {
        // TODO add readonly to input
        // TODO reset placeholder
        this.#isEditMode = false;
        this.#inputEl.setAttribute("readonly", "");
        this.#applyValue(this.#value);
        /* --- */
        this.#scrollContainerEl.style.display = "";
        this.#scrollContainerEl.style.bottom = "";
        this.#scrollContainerEl.style.top = "";
        const all = this.querySelectorAll(`[value]`);
        for (const el of all) {
            el.style.display = "";
        }
        const marked = this.querySelector(".marked");
        if (marked != null) {
            marked.classList.remove("marked");
        }
    }

    #applyValue(value) {
        const el = this.querySelector(`[value="${value}"]`);
        if (el != null) {
            this.#inputEl.value = el.innerHTML;
        } else {
            this.#inputEl.value = value;
        }
    }

    #moveMarker(modeUp = false) {
        const marked = this.querySelector(".marked");
        const el = this.#moveSelection(modeUp);
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

    #moveSelection(modeUp = false) {
        const marked = this.querySelector(`[value="${this.#value}"]`);
        let el;
        if (marked != null) {
            if (modeUp) {
                el = marked.previousElementSibling;
                while (el != null && el.style.display == "none") {
                    el = el.previousElementSibling;
                }
            } else {
                el = marked.nextElementSibling;
                while (el != null && el.style.display == "none") {
                    el = el.nextElementSibling;
                }
            }
        } else {
            el = this.querySelector("[value]");
            while (el != null && el.style.display == "none") {
                el = el.nextElementSibling;
            }
        }
        if (el != null) {
            this.#value = el.value;
            this.#onInput();
        }
        return el;
    }

    #sort = debounce(() => {
        this.#slotEventManager.setActive(false);
        sortChildrenByText(this, `[value]`);
        this.#slotEventManager.setActive(true);
    });

}

FormElementRegistry.register("search-select", SearchSelect);
customElements.define("emc-select-search", SearchSelect);
