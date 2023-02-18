import AbstractElement from "./AbstractElement.js";
import TPL from "./AbstractLiteralValueElement.js.html" assert {type: "html"};
import STYLE from "./AbstractLiteralValueElement.js.css" assert {type: "css"};

export default class AbstractLiteralValueElement extends AbstractElement {

    #type;

    constructor(type, caption) {
        super(caption);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("body").append(els);
        this.#type = type;
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    calculate(state = {}) {
        if (state[this.ref] != null) {
            const val = state[this.ref];
            this.shadowRoot.getElementById("header").setAttribute("value", val);
            return val;
        }
        this.shadowRoot.getElementById("header").setAttribute("value", "0");
        return 0;
    }

    toJSON() {
        return {
            type: this.#type,
            ref: this.ref
        };
    }

    loadLogic(logic) {
        this.ref = logic.ref ?? logic.el;
    }

    static get observedAttributes() {
        const attr = AbstractElement.observedAttributes;
        attr.push("ref");
        return attr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "ref": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("ref").innerHTML = newValue;
                }
            } break;
        }
    }

}
