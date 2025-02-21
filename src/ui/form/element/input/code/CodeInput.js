import AbstractFormElement from "../../AbstractFormElement.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import {
    safeSetAttribute
} from "../../../../../util/helper/ui/NodeAttributes.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import TPL from "./CodeInput.js.html" assert {type: "html"};
import STYLE from "./CodeInput.js.css" assert {type: "css"};

const LAST_CHARACTER_NEWLINE = /\n$/;

// TODO add css variables for code editor colors
// TODO customize scrollbars to have sharp corners and transparent backgrounds
export default class CodeInput extends AbstractFormElement {

    #fieldEl;

    #containerEl;

    #lineNumbersEl;

    #lineMarkerEl;

    #inputEl;

    #inputMirrorEl;

    #outputWrapperEl;

    #lineInfoEl;

    #expandButtonEl;

    #lineCount = 1;

    #currentLine = 0;

    constructor() {
        super();
        this.#fieldEl = this.shadowRoot.getElementById("field");
        this.#fieldEl.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#lineNumbersEl = this.shadowRoot.getElementById("line-numbers");
        this.#lineMarkerEl = this.shadowRoot.getElementById("line-marker");
        this.#lineInfoEl = this.shadowRoot.getElementById("line-info");
        this.#expandButtonEl = this.shadowRoot.getElementById("expand-button");
        this.#outputWrapperEl = this.shadowRoot.getElementById("output-wrapper");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputMirrorEl = this.shadowRoot.getElementById("input-mirror");
        this.#inputEl.addEventListener("input", () => {
            const value = this.#inputEl.value;
            this.#updateText(value);
            this.value = value;
        });
        this.#inputEl.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                const value = this.#inputEl.value;
                const before_tab = value.slice(0, this.#inputEl.selectionStart);
                const after_tab = value.slice(this.#inputEl.selectionEnd, value.length);
                const cursor_pos = this.#inputEl.selectionEnd + 1;

                const newValue = before_tab + "\t" + after_tab;
                this.#inputEl.value = newValue;
                this.#inputEl.selectionStart = cursor_pos;
                this.#inputEl.selectionEnd = cursor_pos;

                this.#updateText(newValue);
                this.value = newValue;

                event.preventDefault();
                return false;
            }
            if (event.key === "Enter" && event.shiftKey === this.sendOnShift) {
                event.stopPropagation();
                return false;
            }
        });
        /* --- */
        this.#containerEl.addEventListener("scroll", () => {
            const scrollTop = this.#containerEl.scrollTop;
            this.#inputEl.scrollTop = scrollTop;
            this.#outputWrapperEl.scrollTop = scrollTop;
            this.#updateCaretPosition(true);
        }, {passive: false});
        this.#inputEl.addEventListener("scroll", () => {
            const scrollTop = this.#inputEl.scrollTop;
            this.#containerEl.scrollTop = scrollTop;
            this.#outputWrapperEl.scrollTop = scrollTop;
            this.#updateCaretPosition(true);
        }, {passive: false});
        /* --- */
        this.#inputEl.addEventListener("focus", (event) => {
            event.stopPropagation();
            const selection = this.shadowRoot.getSelection();
            if (selection.focusNode != null) {
                this.#updateCaretPosition();
            }
        });
        document.addEventListener("selectionchange", () => {
            const selection = this.shadowRoot.getSelection();
            if (selection.focusNode != null) {
                this.#updateCaretPosition();
            }
        }, {passive: true});
        /* --- */
        this.#expandButtonEl.addEventListener("click", () => {
            if (this.#fieldEl.classList.contains("expanded")) {
                this.#fieldEl.classList.remove("expanded");
                this.#expandButtonEl.innerText = "⛶";
            } else {
                this.#fieldEl.classList.add("expanded");
                this.#expandButtonEl.innerText = "🗙";
            }
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "readonly"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    safeSetAttribute(this.#inputEl, "readonly", this.readonly);
                }
            } break;
        }
    }

    renderValue(value) {
        this.#inputEl.value = value ?? "";
        this.#updateText(value);
    }

    #updateText(value) {
        const lineCount = value.split("\n").length;
        this.#printLineNumbers(lineCount);
        if (LAST_CHARACTER_NEWLINE.test(value)) {
            this.#inputMirrorEl.innerText = `${value} `;
        } else {
            this.#inputMirrorEl.innerText = value;
        }
    }

    #updateCaretPosition = debounce((force = false) => {
        const selectionStart = this.#inputEl.selectionStart;
        const selectionEnd = this.#inputEl.selectionEnd;
        const selectionForward = this.#inputEl.selectionDirection === "forward";
        const value = this.#inputEl.value;
        const textBeforeCursor = value.slice(0, selectionForward ? selectionEnd : selectionStart);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;
        const focusOffset = lines.at(-1)?.length ?? 0;

        if (this.#currentLine != currentLine || force) {
            this.#currentLine = currentLine;

            const oldNumbersNodes = this.#lineNumbersEl.querySelectorAll(".caret");
            for (const oldNode of oldNumbersNodes) {
                oldNode.classList.remove("caret");
            }

            const numberEl = this.#lineNumbersEl.children[currentLine];
            if (numberEl != null) {
                numberEl.classList.add("caret");
            }

            this.#lineMarkerEl.style.setProperty("--current-line", currentLine);
        }

        const length = Math.abs(selectionEnd - selectionStart);
        if (length > 0) {
            this.#lineInfoEl.innerText = `Ln ${currentLine + 1}, Col ${focusOffset + 1} (${length} selected)`;
        } else {
            this.#lineInfoEl.innerText = `Ln ${currentLine + 1}, Col ${focusOffset + 1}`;
        }
    });

    #printLineNumbers(lineCount) {
        if (this.#lineCount != lineCount) {
            this.#lineCount = lineCount;
            this.#lineNumbersEl.innerHTML = "";
            for (let i = 0; i < lineCount; ++i) {
                const numberEl = document.createElement("div");
                numberEl.innerText = i + 1;
                this.#lineNumbersEl.append(numberEl);
            }
            this.#containerEl.style.setProperty("--num-digits", `${lineCount}`.length);
        }
    }

}

FormElementRegistry.register("CodeInput", CodeInput);
customElements.define("emc-input-code", CodeInput);
registerFocusable("emc-input-code");
