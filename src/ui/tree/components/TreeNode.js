import CustomElement from "./element/CustomElement.js";

import TPL from "./TreeNode.js.html" assert {type: "html"};
import STYLE from "./TreeNode.js.css" assert {type: "css"};

export default class TreeNode extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get collapsible() {
        return this.getAttribute("collapsible");
    }

    set collapsible(val) {
        this.setAttribute("collapsible", val);
    }

    get expanded() {
        return this.getAttribute("expanded");
    }

    set expanded(val) {
        this.setAttribute("expanded", val);
    }

    static get observedAttributes() {
        return ["collapsible", "expanded"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "collapsible": {
                    // TODO
                } break;
                case "expanded": {
                    // TODO
                } break;
            }
        }
    }

}

