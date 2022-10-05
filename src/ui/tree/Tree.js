import CustomElement from "./element/CustomElement.js";

import TPL from "./Tree.js.html" assert {type: "html"};
import STYLE from "./Tree.js.css" assert {type: "css"};

export default class Tree extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get src() {
        return this.getAttribute("src");
    }

    set src(val) {
        this.setAttribute("src", val);
    }

    static get observedAttributes() {
        return ["src"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "src":
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("value").style.backgroundImage = `url("${newValue}")`;
                }
                break;
        }
    }

}

