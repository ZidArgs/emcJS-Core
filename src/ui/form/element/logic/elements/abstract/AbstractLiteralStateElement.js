import AbstractElement from "./AbstractElement.js";
import "../../../select/SearchSelect.js";
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
        for (const name in options) {
            const optionEl = document.createElement("emc-option");
            optionEl.setAttribute("value", name);
            const textValue = options[name];
            if (typeof textValue === "string" && textValue !== "") {
                const labelEl = document.createElement("emc-i18n-label");
                labelEl.i18nValue = textValue;
                optionEl.append(labelEl);
            } else if (name !== "") {
                const labelEl = document.createElement("emc-i18n-label");
                labelEl.i18nValue = name;
                optionEl.append(labelEl);
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
        this.ref = logic.ref ?? logic.content;
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
