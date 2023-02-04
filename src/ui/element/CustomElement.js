// import TPL from "./CustomElement.js.html" assert {type: "html"};
import STYLE from "./CustomElement.js.css" assert {type: "css"};

export default class CustomElement extends HTMLElement {

    constructor() {
        if (new.target === CustomElement) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.attachShadow({mode: "open"});
        // this.shadowRoot.append(TPL.generate());
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
        if (value == null || value === "false") {
            return false;
        }
        return true;
    }

    setJSONAttribute(name, value) {
        if (value != null) {
            this.setAttribute(name, JSON.stringify(value));
        } else {
            this.removeAttribute(name);
        }
    }

    getJSONAttribute(name) {
        return JSON.parse(this.getAttribute(name));
    }

}
