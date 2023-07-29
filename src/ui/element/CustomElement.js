import {
    scrollIntoView, scrollIntoViewIfNeeded
} from "../../util/helper/ui/Scroll.js";
import {
    getInnerText
} from "../../util/helper/ui/ExtractText.js";
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

    connectedCallback() {
        // ignore
    }

    disconnectedCallback() {
        // ignore
    }

    getText() {
        return getInnerText(this);
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

    setNumberAttribute(name, value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            this.setAttribute(name, parsedValue);
        } else {
            this.removeAttribute(name);
        }
    }

    getNumberAttribute(name) {
        const value = this.getAttribute(name);
        if (value != null) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
                return parsedValue;
            }
        }
        return null;
    }

    setJSONAttribute(name, value) {
        if (value != null) {
            this.setAttribute(name, JSON.stringify(value));
        } else {
            this.removeAttribute(name);
        }
    }

    getJSONAttribute(name) {
        try {
            return JSON.parse(this.getAttribute(name));
        } catch {
            return null;
        }
    }

    scrollIntoViewIfNeeded(options) {
        scrollIntoViewIfNeeded(this, options);
    }

    scrollIntoView(options) {
        scrollIntoView(this, options);
    }

}
