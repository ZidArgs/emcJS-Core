import CustomElement from "../element/CustomElement.js";
import TPL from "./FormContainer.js.html" assert {type: "html"};
// import STYLE from "./FormContainer.js.css" assert {type: "css"};

// TODO add write to storage or write to data
// TODO add reset functionality

export default class FormContainer extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        // STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("value-change", (event) => {
            console.log("value changed", event);
        });
        this.addEventListener("value-reset", (event) => {
            console.log("value reset", event);
        });
        /* --- */
        const formEl = this.shadowRoot.getElementById("form");
        formEl.addEventListener("submit", (event) => {
            // TODO revalidate and then call new submit event
            event.preventDefault();
        });
    }

}

customElements.define("emc-form", FormContainer);
