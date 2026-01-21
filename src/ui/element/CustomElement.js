import EventManagerMixin from "../mixin/EventManagerMixin.js";
import jsonParse from "../../patches/JSONParser.js";
import {isStringNotEmpty} from "../../util/helper/CheckType.js";
import {getInnerText} from "../../util/helper/ui/ExtractText.js";
import {
    scrollIntoView, scrollIntoViewIfNeeded
} from "../../util/helper/ui/Scroll.js";
import STYLE from "./CustomElement.js.css" assert {type: "css"};
import SCROLLBAR_STYLE from "../../_style/scrollbar.css" assert {type: "css"};

export default class CustomElement extends EventManagerMixin(HTMLElement) {

    constructor() {
        if (new.target === CustomElement) {
            throw new Error("can not construct abstract class");
        }
        super();
        /* --- */
        this.attachShadow({
            mode: "open",
            delegatesFocus: this.constructor.delegatesFocus
        });
        STYLE.apply(this.shadowRoot);
        SCROLLBAR_STYLE.apply(this.shadowRoot);
    }

    static get delegatesFocus() {
        return false;
    }

    getText(excludedNodeClasses = []) {
        return getInnerText(this, excludedNodeClasses);
    }

    set disabled(value) {
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    set hidden(value) {
        this.setBooleanAttribute("hidden", value);
    }

    get hidden() {
        return this.getBooleanAttribute("hidden");
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
            const parsedMin = parseFloat(min) || Number.NEGATIVE_INFINITY;
            const parsedMax = parseFloat(max) || Number.POSITIVE_INFINITY;
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
            return jsonParse(this.getAttribute(name));
        } catch {
            return null;
        }
    }

    setEnumAttribute(name, value, allowedValues) {
        if (value != null && allowedValues.includes(value)) {
            this.setAttribute(name, value);
        } else {
            this.removeAttribute(name);
        }
    }

    getEnumAttribute(name) {
        return this.getAttribute(name);
    }

    setListAttribute(name, value, allowedValues) {
        if (Array.isArray(value)) {
            if (allowedValues != null) {
                const acceptedValues = value.filter((val, idx) => allowedValues.includes(val) && value.indexOf(val) === idx);
                this.setAttribute(name, acceptedValues.join(" "));
            } else {
                const acceptedValues = value.filter((val, idx) => value.indexOf(val) === idx);
                this.setAttribute(name, acceptedValues.join(" "));
            }
        } else if (value != null && (allowedValues == null || allowedValues.includes(value))) {
            this.setAttribute(name, value);
        } else {
            this.removeAttribute(name);
        }
    }

    getListAttribute(name) {
        const value = (this.getAttribute(name) ?? "").split(" ");
        return value.filter((val, idx) => isStringNotEmpty(val) && value.indexOf(val) === idx);
    }

    scrollIntoViewIfNeeded(options) {
        scrollIntoViewIfNeeded(this, options);
    }

    scrollIntoView(options) {
        scrollIntoView(this, options);
    }

}
