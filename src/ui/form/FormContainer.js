// TODO add write to storage or write to data
// TODO add reset functionality

export default class FormContainer extends HTMLFormElement {

    constructor() {
        super();
        /* --- */
        this.addEventListener("value-change", (event) => {
            console.log("value changed", event);
        });
        this.addEventListener("value-reset", (event) => {
            console.log("value reset", event);
        });
        this.addEventListener("submit", (event) => {
            console.log("submit", event);
            const formData = new FormData(this);
            console.log("submit data", Object.fromEntries(formData.entries()));
            // TODO revalidate and then call new submit event
            event.stopPropagation();
            event.preventDefault();
        });
        this.addEventListener("reset", (event) => {
            console.log("reset", event);
            event.stopPropagation();
        });
    }

}

customElements.define("emc-form", FormContainer, {extends: "form"});
