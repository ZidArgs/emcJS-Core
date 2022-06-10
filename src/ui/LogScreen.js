import CustomElement from "./element/CustomElement.js";
import TPL from "./LogScreen.html" assert {type: "html"};
import STYLE from "./LogScreen.css" assert {type: "css"};

export default class LogScreen extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    set title(value) {
        this.setAttribute("title", value);
    }

    get title() {
        return this.getAttribute("title");
    }

    static get observedAttributes() {
        return ["title"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "title":
                if (oldValue != newValue) {
                    const title = this.shadowRoot.getElementById("title");
                    title.innerText = newValue;
                }
                break;
        }
    }

}

customElements.define("emc-logscreen", LogScreen);
