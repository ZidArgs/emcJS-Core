import CustomElement from "../../element/CustomElement.js";
import TPL from "./InputResetButton.js.html" assert {type: "html"};
import STYLE from "./InputResetButton.js.css" assert {type: "css"};

export default class InputResetButton extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const resetEl = this.shadowRoot.getElementById("reset");
        resetEl.addEventListener("click", (event) => {
            this.dispatchEvent(new Event("click"));
            event.stopPropagation();
            return false;
        });
    }

}

customElements.define("emc-input-reset", InputResetButton);
