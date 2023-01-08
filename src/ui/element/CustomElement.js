// import TPL from "./CustomElement.html" assert {type: "html"};
import STYLE from "./CustomElement.css" assert {type: "css"};

export default class CustomElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        STYLE.apply(this.shadowRoot);
    }

    setBooleanAttribute(name, value) {
        if (typeof value === "boolean") {
            if (value) {
                this.setAttribute(name, "");
            } else {
                this.removeAttribute(name);
            }
        } else {
            this.setAttribute(name, value);
        }
    }

    getBooleanAttribute(name) {
        const value = this.getAttribute(name);
        if (value === "") {
            return true;
        }
        if (value == null) {
            return false;
        }
        return value;
    }

}
