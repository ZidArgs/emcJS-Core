import Modal from "../../../../../modal/Modal.js";
import CharacterSearch from "../../../../../../util/search/CharacterSearch.js";
import ElementListCache from "../../../../../../util/html/ElementListCache.js";
import EventMultiTargetManager from "../../../../../../util/event/EventMultiTargetManager.js";
import {debounce} from "../../../../../../util/Debouncer.js";
import "../../../../button/Button.js";
import "../../../input/search/SearchInput.js";
import "./ImageSelectPreview.js";
import TPL from "./ImageSelectModal.js.html" assert {type: "html"};
import STYLE from "./ImageSelectModal.js.css" assert {type: "css"};

export default class ImageSelectModal extends Modal {

    #contentEl;

    #footerEl;

    #submitEl;

    #cancelEl;

    #slotEl;

    #searchEl;

    #viewControlEl;

    #viewSizeSmallEl;

    #viewSizeNormalEl;

    #viewSizeBigEl;

    #viewSizeGiganticEl;

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager = new EventMultiTargetManager();

    constructor() {
        super("Select icon...");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#footerEl = this.shadowRoot.getElementById("footer");

        this.#searchEl = els.getElementById("search");
        this.#contentEl.before(this.#searchEl);
        this.#searchEl.addEventListener("change", () => {
            const all = this.children;
            if (this.#searchEl.value) {
                const regEx = new CharacterSearch(this.#searchEl.value);
                for (const el of all) {
                    const testText = el.comparatorText ?? el.innerText;
                    if (regEx.test(testText.trim())) {
                        el.style.display = "";
                    } else {
                        el.style.display = "none";
                    }
                }
            } else {
                for (const el of all) {
                    el.style.display = "";
                }
            }
        });

        this.#viewControlEl = els.getElementById("view-control");
        this.#viewSizeSmallEl = els.getElementById("view-size-small");
        this.#viewSizeNormalEl = els.getElementById("view-size-normal");
        this.#viewSizeBigEl = els.getElementById("view-size-big");
        this.#viewSizeGiganticEl = els.getElementById("view-size-gigantic");

        this.#contentEl.before(this.#viewControlEl);
        this.#viewSizeSmallEl.addEventListener("click", () => {
            this.#contentEl.style.setProperty("--icon-preview-size", "50px");
            this.#viewSizeSmallEl.primary = true;
            this.#viewSizeNormalEl.primary = false;
            this.#viewSizeBigEl.primary = false;
            this.#viewSizeGiganticEl.primary = false;
        });
        this.#viewSizeNormalEl.addEventListener("click", () => {
            this.#contentEl.style.setProperty("--icon-preview-size", "100px");
            this.#viewSizeSmallEl.primary = false;
            this.#viewSizeNormalEl.primary = true;
            this.#viewSizeBigEl.primary = false;
            this.#viewSizeGiganticEl.primary = false;
        });
        this.#viewSizeBigEl.addEventListener("click", () => {
            this.#contentEl.style.setProperty("--icon-preview-size", "200px");
            this.#viewSizeSmallEl.primary = false;
            this.#viewSizeNormalEl.primary = false;
            this.#viewSizeBigEl.primary = true;
            this.#viewSizeGiganticEl.primary = false;
        });
        this.#viewSizeGiganticEl.addEventListener("click", () => {
            this.#contentEl.style.setProperty("--icon-preview-size", "400px");
            this.#viewSizeSmallEl.primary = false;
            this.#viewSizeNormalEl.primary = false;
            this.#viewSizeBigEl.primary = false;
            this.#viewSizeGiganticEl.primary = true;
        });

        this.#cancelEl = els.getElementById("cancel");
        this.#cancelEl.addEventListener("click", () => this.cancel());
        this.#footerEl.append(this.#cancelEl);

        this.#submitEl = els.getElementById("submit");
        this.#submitEl.addEventListener("click", () => this.submit());
        this.#footerEl.append(this.#submitEl);
        /* --- */
        this.#optionSelectEventManager.set("click", (event) => {
            this.value = event.currentTarget.getAttribute("value");
            event.preventDefault();
            event.stopPropagation();
        });
        /* --- */
        this.#slotEl = this.shadowRoot.getElementById("slot");
        this.#slotEl.addEventListener("slotchange", () => {
            this.#onSlotChange();
        });
    }

    submit() {
        this.dispatchEvent(new Event("submit"));
        this.remove();
    }

    cancel() {
        this.dispatchEvent(new Event("cancel"));
        this.remove();
    }

    set value(value) {
        if (value == null) {
            this.removeAttribute("value");
        } else {
            this.setAttribute("value", value);
        }
    }

    get value() {
        return this.getAttribute("value") ?? this.#optionNodeList.first?.value;
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "value": {
                    this.#applyValue(newValue);
                } break;
            }
        }
    }

    #resolveSlottedElements() {
        const optionNodeList = this.#slotEl.assignedElements({flatten: true}).filter((el) => el.matches("[value]"));
        this.#optionNodeList.setNodeList(optionNodeList);
        /* --- */
        this.#optionSelectEventManager.clearTargets();
        for (const el of optionNodeList) {
            this.#optionSelectEventManager.addTarget(el);
        }
        /* --- */
        this.#applyValue(this.value);
    }

    #applyValue(value) {
        const oldSelectedEl = this.querySelector(`.selected`);
        if (oldSelectedEl != null) {
            oldSelectedEl.classList.remove("selected");
        }
        const newSelectedEl = this.querySelector(`[value="${value}"]`);
        if (newSelectedEl != null) {
            newSelectedEl.classList.add("selected");
        }
    }

    #onSlotChange = debounce(() => {
        this.#resolveSlottedElements();
    });

}

customElements.define("emc-select-image-modal", ImageSelectModal);
