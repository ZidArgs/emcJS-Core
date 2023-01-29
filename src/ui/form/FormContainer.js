// TODO add write to storage or write to data
// TODO add reset functionality

export default class FormContainer extends HTMLFormElement {

    constructor() {
        super();
        /* --- */
        this.addEventListener("value", (event) => {
            console.log("value changed", event);
        });
        this.addEventListener("reset", (event) => {
            console.log("value reset", event);
        });
        this.addEventListener("validity", (event) => {
            console.log("value validity", event);
        });
        this.addEventListener("submit", (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.checkValidity()) {
                const formData = new FormData(this);
                console.log("submit", Object.fromEntries(formData.entries()));
            }
        });
        this.addEventListener("reset", (event) => {
            event.stopPropagation();
        });
    }

}

customElements.define("emc-form", FormContainer, {extends: "form"});
