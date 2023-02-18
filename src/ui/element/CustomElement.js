import {
    getScrollParent
} from "../../util/helper/ui/Scroll.js";
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
        return JSON.parse(this.getAttribute(name));
    }

    scrollIntoViewIfNeeded(options) {
        const {behavior = "auto", block, inline, offsetTop = 0, offsetBottom = 0} = options;
        const scrollEl = getScrollParent(this);
        const nodeRect = this.getBoundingClientRect();
        if (nodeRect.top < offsetTop || nodeRect.bottom > scrollEl.clientHeight - offsetBottom) {
            this.scrollIntoView({behavior, block, inline});
        }
    }

}
