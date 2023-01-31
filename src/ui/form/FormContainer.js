// TODO add write to storage or write to data
// TODO add reset functionality

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
        this.addEventListener("value", (event) => {
            console.log("value changed", event);
        });
        this.addEventListener("default", (event) => {
            console.log("value default", event);
        });
        this.addEventListener("validity", (event) => {
            console.log("value validity", event);
        });
        this.addEventListener("submit", () => {
            if (this.checkValidity()) {
                console.log("submit (valid)", this.getData());
            } else {
                console.log("submit (invalid)", this.getData());
            }
        });
        this.addEventListener("reset", () => {
            console.log("reset all");
        });
    }

    getData() {
        const formData = new FormData(this);
        return Object.fromEntries(formData.entries());
    }

    // get elements() {return super.elements}

}

customElements.define("emc-form", FormContainer, {extends: "form"});
