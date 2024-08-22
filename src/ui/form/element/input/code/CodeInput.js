import AbstractFormElement from "../../AbstractFormElement.js";
import {
    debounce
} from "../../../../../util/Debouncer.js";
import {
    registerFocusable
} from "../../../../../util/helper/html/getFocusableElements.js";
import FormElementRegistry from "../../../../../data/registry/form/FormElementRegistry.js";
import TPL from "./CodeInput.js.html" assert {type: "html"};
import STYLE from "./CodeInput.js.css" assert {type: "css"};

// XXX currently only as readonly usable
// FIXME ctrl+z/y
export default class CodeInput extends AbstractFormElement {

    #fieldEl;

    #containerEl;

    #lineNumbersEl;

    #inputEl;

    #lineInfoEl;

    #expandButtonEl;

    #value = "";

    constructor() {
        super();
        this.#fieldEl = this.shadowRoot.getElementById("field");
        this.#fieldEl.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#lineNumbersEl = this.shadowRoot.getElementById("line-numbers");
        this.#lineInfoEl = this.shadowRoot.getElementById("line-info");
        this.#expandButtonEl = this.shadowRoot.getElementById("expand-button");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("input", () => {
            const children = [...this.#inputEl.children];
            const lines = children.length;
            this.#containerEl.style.setProperty("--num-digits", `${lines}`.length);
            this.#lineNumbersEl.innerHTML = "";
            for (let i = 0; i < lines; ++i) {
                const numberEl = document.createElement("div");
                numberEl.innerText = i + 1;
                this.#lineNumbersEl.append(numberEl);
            }
            this.#onInput(children.map((ch) => ch.innerText).join("\n"));
        }, {passive: true});
        this.#inputEl.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && this.#inputEl.children.length <= 1 && this.#inputEl.children[0]?.innerText.trim() === "") {
                event.preventDefault();
                return false;
            }
            if (event.key === "Enter" && event.shiftKey === this.sendOnShift) {
                event.stopPropagation();
                return false;
            }
        });
        /* --- */
        this.#inputEl.addEventListener("paste", (event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");

            const selection = this.shadowRoot.getSelection();
            if (!selection.rangeCount) {
                return;
            }
            const range = selection.getRangeAt(0);

            let startContainer = range.startContainer;
            if (startContainer.nodeType === 3) {
                startContainer = startContainer.parentElement;
            }
            let endContainer = range.endContainer;
            if (endContainer.nodeType === 3) {
                endContainer = endContainer.parentElement;
            }

            const [resultText, selectionOffset] = this.#modifyText(startContainer, range.startOffset, endContainer, range.endOffset, text);

            let textNode = endContainer.childNodes[0];
            if (textNode == null) {
                textNode = document.createTextNode("");
                endContainer.append(textNode);
                selection.setPosition(textNode, 0);
            } else {
                selection.setPosition(textNode, selectionOffset);
            }

            this.#value = resultText;
            this.value = resultText;
        });
        /* --- */
        this.#containerEl.addEventListener("scroll", () => {
            this.#inputEl.scrollTop = this.#containerEl.scrollTop;
        }, {passive: true});
        this.#inputEl.addEventListener("scroll", () => {
            this.#containerEl.scrollTop = this.#inputEl.scrollTop;
        }, {passive: true});
        /* --- */
        this.#inputEl.addEventListener("focus", (event) => {
            event.stopPropagation();
            const selection = this.shadowRoot.getSelection();
            this.#styleNode(selection);
        });
        document.addEventListener("selectionchange", () => {
            const selection = this.shadowRoot.getSelection();
            this.#styleNode(selection);
        }, {passive: true});
        this.#inputEl.addEventListener("blur", () => {
            const oldNodes = this.#inputEl.querySelectorAll(".caret");
            const oldNumbersNodes = this.#lineNumbersEl.querySelectorAll(".caret");
            for (const oldNode of oldNodes) {
                oldNode.classList.remove("caret");
            }
            for (const oldNode of oldNumbersNodes) {
                oldNode.classList.remove("caret");
            }
        });
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

    #onInput = debounce((value) => {
        this.#value = value;
        this.value = value;
    }, 300);

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
                    if (this.readonly) {
                        this.#inputEl.removeAttribute("contenteditable");
                    } else {
                        this.#inputEl.setAttribute("contenteditable", "");
                    }
                }
            } break;
        }
    }

    renderValue(value) {
        if (value != null && value !== "") {
            if (value !== this.#value) {
                this.#inputEl.innerHTML = "";
                const lines = value.split(/\n/);
                let lastEl = null;
                for (const line of lines) {
                    lastEl = document.createElement("div");
                    lastEl.innerText = line;
                    this.#inputEl.appendChild(lastEl);
                }
                /* --- */
                const selection = this.shadowRoot.getSelection();
                selection.collapse(lastEl, 1);
                /* --- */
                this.#printLineNumbers(lines.length);
            }
        } else {
            this.#inputEl.innerHTML = "<div><br /></div>";
            this.#lineNumbersEl.innerHTML = "<div>1</div>";
            this.#containerEl.style.setProperty("--num-digits", 1);
        }
    }

    #styleNode = debounce((selection) => {
        const oldNodes = this.#inputEl.querySelectorAll(".caret");
        const oldNumbersNodes = this.#lineNumbersEl.querySelectorAll(".caret");
        for (const oldNode of oldNodes) {
            oldNode.classList.remove("caret");
        }
        for (const oldNode of oldNumbersNodes) {
            oldNode.classList.remove("caret");
        }

        let focusNode = selection.focusNode;
        if (focusNode != null) {
            if (focusNode.nodeType === 3) {
                focusNode = focusNode.parentElement;
            }
            if (focusNode instanceof HTMLElement) {
                focusNode.classList.add("caret");
                const index = this.#getChildElementIndex(focusNode);
                const numberEl = this.#lineNumbersEl.children[index];
                if (numberEl != null) {
                    numberEl.classList.add("caret");
                }

                const selectedString = selection.toString();
                const length = selectedString.length;
                if (length > 0) {
                    this.#lineInfoEl.innerText = `Ln ${index + 1}, Col ${selection.focusOffset + 1} (${length} selected)`;
                } else {
                    this.#lineInfoEl.innerText = `Ln ${index + 1}, Col ${selection.focusOffset + 1}`;
                }
            }
        } else {
            this.#lineInfoEl.innerText = "Ln 1, Col 1";
        }
    });

    #getChildElementIndex(node) {
        if (node.parentNode != null) {
            return Array.prototype.indexOf.call(node.parentNode.children, node);
        }
        return -1;
    }

    #modifyText(startContainer, startOffset, endContainer, endOffset, text) {
        const textLines = text.split("\n");
        const resultLines = [];
        let lastLineLength = 0;
        const startLine = startContainer.innerText;
        const startLinePart = startLine.slice(0, startOffset);
        const endLine = endContainer.innerText;
        const endLinePart = endLine.slice(endOffset);

        let currentChild = this.#inputEl.children[0];
        while (currentChild !== startContainer) {
            resultLines.push(currentChild.innerText);
            currentChild = currentChild.nextSibling;
        }

        while (startContainer !== endContainer) {
            const nextContainer = startContainer.nextSibling;
            startContainer.remove();
            startContainer = nextContainer;
        }

        if (textLines.length > 1) {
            const firstLine = startLinePart + textLines.shift();
            resultLines.push(firstLine);
            const firstContainer = document.createElement("div");
            firstContainer.innerText = firstLine;
            endContainer.insertAdjacentElement("beforebegin", firstContainer);

            while (textLines.length > 1) {
                const currentLine = textLines.shift();
                resultLines.push(currentLine);
                const currentContainer = document.createElement("div");
                currentContainer.innerText = currentLine;
                endContainer.insertAdjacentElement("beforebegin", currentContainer);
            }

            const lastTextLine = textLines.shift();
            lastLineLength = lastTextLine.length;
            const lastLine = lastTextLine + endLinePart;
            resultLines.push(lastLine);
            endContainer.innerText = lastLine;
        } else {
            const lastTextLine = textLines.shift();
            lastLineLength = startLinePart.length + lastTextLine.length;
            const line = startLinePart + lastTextLine + endLinePart;
            resultLines.push(line);
            endContainer.innerText = line;
        }

        currentChild = endContainer.nextSibling;
        while (currentChild != null) {
            resultLines.push(currentChild.innerText);
            currentChild = currentChild.nextSibling;
        }

        this.#printLineNumbers(resultLines.length);

        return [resultLines.join("\n"), lastLineLength];
    }

    #printLineNumbers(lineCount) {
        this.#lineNumbersEl.innerHTML = "";
        for (let i = 0; i < lineCount; ++i) {
            const numberEl = document.createElement("div");
            numberEl.innerText = i + 1;
            this.#lineNumbersEl.append(numberEl);
        }
        this.#containerEl.style.setProperty("--num-digits", `${lineCount}`.length);
    }

}

FormElementRegistry.register("CodeInput", CodeInput);
customElements.define("emc-input-code", CodeInput);
registerFocusable("emc-input-code");
