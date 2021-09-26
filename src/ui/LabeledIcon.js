import Template from "../util/html/Template.js";
import GlobalStyle from "../util/html/GlobalStyle.js";
import CustomElement from "./CustomElement.js";

const TPL = new Template(`
<div id="value">
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-block;
    width: 20px;
    height: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host(:hover) {
    background-size: 100%;
}
#value {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    color: white;
    font-size: 0.8em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    line-height: 0.7em;
    font-weight: bold;
    word-break: normal;
}
`);

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
