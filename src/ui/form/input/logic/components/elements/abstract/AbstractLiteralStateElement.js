import AbstractElement from "./AbstractElement.js";
import LogicOperatorRegistry from "../../../../../../../../data/registry/LogicOperatorRegistry.js";
import TPL from "./AbstractLiteralStateElement.js.html" assert {type: "html"};
import STYLE from "./AbstractLiteralStateElement.js.css" assert {type: "css"};

export default class AbstractLiteralStateElement extends AbstractElement {

    #inputEl;

    #type;

    #options;

    constructor(type, caption) {
        super(caption);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("body").append(els);
        this.#type = type;
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.addEventListener("change", () => {
            this.value = this.#inputEl.value;
        });
    }

    getElement(forceCopy = false) {
        if (forceCopy || this.template) {
            const node = this.cloneNode(true);
            node.removeAttribute("template");
            node.setOptions(this.#options);
            return node;
        } else {
            return this;
        }
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    setOptions(options) {
        this.#options = options;
        this.#inputEl.innerHTML = "";
        if (Array.isArray(options)) {
            for (const value of options) {
                this.#addOption(value);
            }
        } else {
            for (const value in options) {
                const label = options[value];
                this.#addOption(value, label);
            }
        }
    }

    #addOption(value, label) {
        if (typeof value === "string" && value !== "") {
            const optionEl = document.createElement("option", {is: "emc-i18n-option"});
            optionEl.value = value;
            if (typeof label === "string" && label !== "") {
                optionEl.i18nValue = label;
            } else {
                optionEl.i18nValue = value;
            }
            this.#inputEl.append(optionEl);
        }
    }

    calculate(state = {}) {
        if (state[this.ref] != null) {
            const val = +(state[this.ref] === this.value);
            this.shadowRoot.getElementById("header").setAttribute("value", val);
            return val;
        } else {
            this.shadowRoot.getElementById("header").setAttribute("value", "0");
            return 0;
        }
    }

    toJSON() {
        return {
            type: this.#type,
            ref: this.ref,
            value: this.value
        };
    }

    loadLogic(logic) {
        this.ref = logic.ref;
        const operatorConfig = LogicOperatorRegistry.getOperator(logic.ref);
        if (operatorConfig != null) {
            this.setOptions(operatorConfig.options);
        }
        this.value = logic.value;
    }

    static get observedAttributes() {
        const attr = AbstractElement.observedAttributes;
        attr.push("ref", "value");
        return attr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "disabled":
            case "template":
            case "readonly": {
                if (oldValue != newValue) {
                    if (this.editable) {
                        this.#inputEl.removeAttribute("disabled");
                    } else {
                        this.#inputEl.setAttribute("disabled", "true");
                    }
                }
            } break;
            case "ref": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("ref").innerHTML = newValue;
                }
            } break;
            case "value": {
                if (oldValue != newValue) {
                    this.#inputEl.value = newValue;
                }
            } break;
        }
    }

}
