export default class FormContainer extends HTMLFormElement {

    constructor() {
        super();
        /* --- */
        this.addEventListener("change", (event) => {
            const targetEl = event.target;
            if (targetEl.type !== "radio" && targetEl.type !== "checkbox") {
                const name = event.target.name;
                if (name) {
                    const all = this.querySelectorAll(`[name="${name}"]`);
                    for (const el of all) {
                        if (el != event.target) {
                            el.value = event.target.value;
                        }
                    }
                }
            }
        });
    }

    getData() {
        const formData = new FormData(this);
        return Object.fromEntries(formData.entries());
    }

}

customElements.define("emc-form", FormContainer, {extends: "form"});
