import CustomElement from "../element/CustomElement.js";
import FormField from "./field/FormField.js";
import TPL from "./FormContainer.js.html" assert {type: "html"};
// import STYLE from "./FormContainer.js.css" assert {type: "css"};

// TODO add write to storage or write to data
// TODO add reset functionality

export default class FormContainer extends CustomElement {

    #containedElements = new Set();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        // STYLE.apply(this.shadowRoot);
        /* --- */
        const formEl = this.shadowRoot.getElementById("form");
        const contentsEl = this.shadowRoot.getElementById("contents");
        formEl.addEventListener("submit", (event) => {
            event.preventDefault();
        });
        contentsEl.addEventListener("slotchange", () => {
            // TODO
            const allElements = contentsEl.assignedNodes();
            for (const el of this.#containedElements) {
                if (!allElements.includes(el)) {
                    this.#removeElement(el);
                }
            }
            for (const el of allElements) {
                if (!this.#containedElements.has(el) && el instanceof FormField) {
                    this.#addElement(el);
                }
            }
            console.log("slot changed", Array.from(this.#containedElements))
        });
    }

    #removeElement(el) {
        el.removeEventListener("change", this.#onValueChange);
        el.removeEventListener("reset", this.#onValueReset);
        // TODO remove storage-value-handling
        this.#containedElements.delete(el);
    }

    #addElement(el) {
        el.addEventListener("change", this.#onValueChange);
        el.addEventListener("reset", this.#onValueReset);
        // TODO add storage-value-handling
        this.#containedElements.add(el);
    }

    #onValueChange(event) {
        console.log("value changed", event)
    }

    #onValueReset(event) {
        console.log("value reset", event)
    }

}

customElements.define("emc-form", FormContainer);
