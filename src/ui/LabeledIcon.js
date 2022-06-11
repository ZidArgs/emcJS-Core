import CustomElement from "./element/CustomElement.js";
import TPL from "./LabeledIcon.js.html" assert {type: "html"};
import STYLE from "./LabeledIcon.js.css" assert {type: "css"};

function getAlign(value) {
    switch (value) {
        case "start":
            return "flex-start";
        case "end":
            return "flex-end";
        default:
            return "center";
    }
}

export default class LabeledIcon extends CustomElement {

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

    get text() {
        return this.getAttribute("text");
    }

    set text(val) {
        this.setAttribute("text", val);
    }

    get halign() {
        return this.getAttribute("halign");
    }

    set halign(val) {
        this.setAttribute("halign", val);
    }

    get valign() {
        return this.getAttribute("halign");
    }

    set valign(val) {
        this.setAttribute("valign", val);
    }

    static get observedAttributes() {
        return ["src", "text", "halign", "valign"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "src":
                    this.shadowRoot.getElementById("value").style.backgroundImage = `url("${newValue}")`;
                    break;
                case "text":
                    this.shadowRoot.getElementById("value").innerHTML = newValue;
                    break;
                case "halign":
                    this.shadowRoot.getElementById("value").style.justifyContent = getAlign(newValue);
                    break;
                case "valign":
                    this.shadowRoot.getElementById("value").style.alignItems = getAlign(newValue);
                    break;
            }
        }
    }

}

customElements.define("emc-labeledicon", LabeledIcon);
