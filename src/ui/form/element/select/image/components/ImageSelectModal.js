import Modal from "../../../../../modal/Modal.js";
import CharacterSearch from "../../../../../../util/search/CharacterSearch.js";
import ElementListCache from "../../../../../../util/html/ElementListCache.js";
import EventMultiTargetManager from "../../../../../../util/event/EventMultiTargetManager.js";
import {
    debounce
} from "../../../../../../util/Debouncer.js";
import "../../../../button/Button.js";
import "../../../input/search/SearchInput.js";
import "./ImageSelectPreview.js";
import TPL from "./ImageSelectModal.js.html" assert {type: "html"};
import STYLE from "./ImageSelectModal.js.css" assert {type: "css"};

export default class ImageSelectModal extends Modal {

    #slotEl;

    #optionNodeList = new ElementListCache();

    #optionSelectEventManager = new EventMultiTargetManager();

    constructor() {
        super("Select icon...");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const footerEl = this.shadowRoot.getElementById("footer");
        const contentEl = this.shadowRoot.getElementById("content");

        const searchEl = els.getElementById("search");
        contentEl.before(searchEl);
        searchEl.addEventListener("change", () => {
            const all = this.children;
            if (searchEl.value) {
                const regEx = new CharacterSearch(searchEl.value);
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

        const viewControlEl = els.getElementById("view-control");
        const viewSizeSmallEl = els.getElementById("view-size-small");
        const viewSizeNormalEl = els.getElementById("view-size-normal");
        const viewSizeBigEl = els.getElementById("view-size-big");
        const viewSizeGiganticEl = els.getElementById("view-size-gigantic");

        contentEl.before(viewControlEl);
        viewSizeSmallEl.addEventListener("click", () => {
            contentEl.style.setProperty("--icon-preview-size", "50px");
            viewControlEl.className = "size-small";
        });
        viewSizeNormalEl.addEventListener("click", () => {
            contentEl.style.setProperty("--icon-preview-size", "100px");
            viewControlEl.className = "size-normal";
        });
        viewSizeBigEl.addEventListener("click", () => {
            contentEl.style.setProperty("--icon-preview-size", "200px");
            viewControlEl.className = "size-big";
        });
        viewSizeGiganticEl.addEventListener("click", () => {
            contentEl.style.setProperty("--icon-preview-size", "400px");
            viewControlEl.className = "size-gigantic";
        });

        const cancelEl = els.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());
        footerEl.append(cancelEl);

        const submitEl = els.getElementById("submit");
        submitEl.addEventListener("click", () => this.submit());
        footerEl.append(submitEl);
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
