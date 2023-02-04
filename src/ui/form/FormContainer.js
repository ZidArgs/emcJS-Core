export default class FormContainer extends HTMLFormElement {

    getData() {
        const formData = new FormData(this);
        return Object.fromEntries(formData.entries());
    }

}

customElements.define("emc-form", FormContainer, {extends: "form"});
