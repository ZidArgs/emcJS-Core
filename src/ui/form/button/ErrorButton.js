import Button from "./Button.js";
import {registerFocusable} from "../../../util/helper/html/getFocusableElements.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {debounce} from "../../../util/Debouncer.js";
import TPL from "./ErrorButton.js.html" assert {type: "html"};
import STYLE from "./ErrorButton.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./ErrorButton.js.json" assert {type: "json"};

export default class ErrorButton extends Button {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #isPopupVisible = false;

    #scrollContainerEl;

    #errorContainerEl;

    #errorList = new Map();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#errorContainerEl = this.shadowRoot.getElementById("error-container");
        this.#scrollContainerEl.addEventListener("wheel", (event) => {
            event.stopPropagation();
        }, {passive: true});
        /* --- */
        window.addEventListener("wheel", () => {
            if (this.#isPopupVisible) {
                this.#closePopup();
            }
        }, {passive: true});
        window.addEventListener("blur", () => {
            if (this.#isPopupVisible) {
                this.#closePopup();
            }
        }, {passive: true});
        window.addEventListener("mousedown", (event) => {
            if (this.#isPopupVisible && !this.contains(event.target)) {
                this.#closePopup();
            }
        }, {passive: true});
        /* --- */
        super.setCount("0", "success");
    }

    clickHandler(event) {
        if (super.clickHandler(event)) {
            if (this.#isPopupVisible) {
                this.#closePopup();
            } else {
                this.#openPopup();
            }
            return true;
        }
        return false;
    }

    set action(value) {
        this.setAttribute("action", value);
    }

    get action() {
        return this.getAttribute("action");
    }

    setErrors(errors) {
        this.#errorList.clear();
        this.#errorContainerEl.innerHTML = "";
        for (const errorEntry of errors) {
            this.addError(errorEntry);
        }
    }

    addError(errorEntry) {
        const inputEl = errorEntry.element;
        if (this.#errorList.has(inputEl)) {
            const errorEl = this.#errorList.get(inputEl);
            this.#renderErrorLabel(errorEntry, errorEl);
        } else {
            const errorLabelEl = this.#renderErrorLabel(errorEntry);
            this.#errorList.set(inputEl, errorLabelEl);
            this.#errorContainerEl.append(errorLabelEl);
        }
        this.#updateErrorCount();
    }

    removeError(inputEl) {
        if (this.#errorList.has(inputEl)) {
            const errorLabelEl = this.#errorList.get(inputEl);
            errorLabelEl.remove();
            this.#errorList.delete(inputEl);
        }
        this.#updateErrorCount();
    }

    #openPopup() {
        this.#isPopupVisible = true;
        const thisRect = this.getBoundingClientRect();
        this.#scrollContainerEl.style.display = "block";
        this.#scrollContainerEl.style.minWidth = `${thisRect.width}px`;
        this.#scrollContainerEl.style.zIndex = 200;
        const containerRect = this.#scrollContainerEl.getBoundingClientRect();
        if (thisRect.bottom + containerRect.height > window.innerHeight - 25) {
            this.#scrollContainerEl.style.bottom = `${window.innerHeight - thisRect.top}px`;
        } else {
            this.#scrollContainerEl.style.top = `${thisRect.bottom}px`;
        }
        if (thisRect.left + containerRect.width > window.innerWidth - 25) {
            if (thisRect.right - containerRect.width < 25) {
                this.#scrollContainerEl.style.left = "25px";
                this.#scrollContainerEl.style.right = "25px";
            } else {
                this.#scrollContainerEl.style.right = `${window.innerWidth - thisRect.right}px`;
            }
        } else {
            this.#scrollContainerEl.style.left = `${thisRect.left}px`;
        }
    }

    #closePopup() {
        this.#isPopupVisible = false;
        this.#scrollContainerEl.style.display = "";
        this.#scrollContainerEl.style.bottom = "";
        this.#scrollContainerEl.style.top = "";
        this.#scrollContainerEl.style.left = "";
        this.#scrollContainerEl.style.right = "";
        this.#scrollContainerEl.style.zIndex = "";
    }

    #renderErrorLabel(errorEntry, errorEl) {
        const name = errorEntry.label ? `<emc-i18n-label i18n-value="${errorEntry.label}"></emc-i18n-label>` : errorEntry.name ?? "";
        errorEl = errorEl ?? document.createElement("div");
        errorEl.className = "error-label";
        errorEl.innerHTML = `Errors in field "${name}":`;
        // ---
        const ulEl = document.createElement("ul");
        for (const error of errorEntry.errors) {
            const liEl = document.createElement("li");
            const textboxEl = document.createElement("emc-i18n-textbox");
            textboxEl.i18nContent = error;
            liEl.append(textboxEl);
            ulEl.append(liEl);
        }
        errorEl.append(ulEl);
        // ---
        errorEl.addEventListener("click", () => {
            errorEntry.element.focus();
            this.#closePopup();
        });
        return errorEl;
    }

    #updateErrorCount = debounce(() => {
        const errorCount = this.#errorList.size;
        if (errorCount > 0) {
            super.setCount(errorCount, "error");
        } else {
            super.setCount("0", "success");
        }
    });

}

customElements.define("emc-button-error", ErrorButton);
registerFocusable("emc-button-error");
