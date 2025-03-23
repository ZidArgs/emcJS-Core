import {createMixin} from "../../util/Mixin.js";
import {
    scrollIntoView, scrollIntoViewIfNeeded
} from "../../util/helper/ui/Scroll.js";
import {getInnerText} from "../../util/helper/ui/ExtractText.js";
import STYLE from "./CustomElementMixin.js.css" assert {type: "css"};

export default createMixin((superclass) => class CustomElementMixin extends superclass {

    constructor(...args) {
        super(...args);
        /* --- */
        this.attachShadow({
            mode: "open",
            delegatesFocus: this.constructor.delegatesFocus
        });
        STYLE.apply(this.shadowRoot);
    }

    static get delegatesFocus() {
        return false;
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
    }

    static get observedAttributes() {
        if (super.observedAttributes) {
            return super.observedAttributes;
        }
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (super.attributeChangedCallback) {
            super.attributeChangedCallback(name, oldValue, newValue);
        }
    }

    getText() {
        return getInnerText(this);
    }

    setBooleanAttribute(name, value) {
        if (value == null) {
            this.removeAttribute(name);
        } else if (typeof value === "boolean") {
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
        if (value === "" || value === "true") {
            return true;
        }
        return value;
    }

    setStringAttribute(name, value) {
        if (value == null) {
            this.removeAttribute(name);
        } else {
            this.setAttribute(name, value.toString());
        }
    }

    getStringAttribute(name) {
        return this.getAttribute(name);
    }

    setNumberAttribute(name, value, min, max) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const parsedMin = parseFloat(min) || Number.MIN_VALUE;
            const parsedMax = parseFloat(max) || Number.MAX_VALUE;
            if (parsedMin > parsedMax) {
                throw new Error("min can't be greater than max");
            }
            if (parsedValue < parsedMin) {
                this.setAttribute(name, parsedMin);
            } else if (parsedValue > parsedMax) {
                this.setAttribute(name, parsedMax);
            } else {
                this.setAttribute(name, parsedValue);
            }
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

    setIntAttribute(name, value, min, max) {
        const parsedValue = parseInt(value);
        if (!isNaN(parsedValue)) {
            const parsedMin = parseInt(min) || Number.MIN_SAFE_INTEGER;
            const parsedMax = parseInt(max) || Number.MAX_SAFE_INTEGER;
            if (parsedMin > parsedMax) {
                throw new Error("min can't be greater than max");
            }
            if (parsedValue < parsedMin) {
                this.setAttribute(name, parsedMin);
            } else if (parsedValue > parsedMax) {
                this.setAttribute(name, parsedMax);
            } else {
                this.setAttribute(name, parsedValue);
            }
        } else {
            this.removeAttribute(name);
        }
    }

    getIntAttribute(name) {
        const value = this.getAttribute(name);
        if (value != null) {
            const parsedValue = parseInt(value);
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

    setListAttrinute(name, value, allowedValues) {
        if (Array.isArray(value)) {
            const acceptedValues = value.filter((val) => allowedValues.includes(val));
            this.setAttribute(name, acceptedValues.join(" "));
        } else if (allowedValues.includes(value)) {
            this.setAttribute(name, value);
        } else {
            this.removeAttribute(name);
        }
    }

    getEnumAttrinute(name) {
        return this.getAttribute(name).split(" ");
    }

    scrollIntoViewIfNeeded(options) {
        scrollIntoViewIfNeeded(this, options);
    }

    scrollIntoView(options) {
        scrollIntoView(this, options);
    }

});

