import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import CustomElement from "../../CustomElement.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    position: fixed;
    display: block;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    cursor: default;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 900400;
}
:host(:empty) {
    display: none;
}
`);

const LAYER = new Map();
let DEFAULT = null;

export default class WindowLayer extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        /* --- */
        if (DEFAULT == null) {
            DEFAULT = this;
        }
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    static get observedAttributes() {
        return ["name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "name" && newValue != oldValue) {
            if (LAYER.has(newValue)) {
                throw new Error(`MessageLayer with name "${name}" already exists`);
            }
            LAYER.set(newValue, this);
            if (LAYER.has(oldValue)) {
                LAYER.delete(oldValue);
            }
        }
    }

    setDefault() {
        DEFAULT = this;
    }

    static setDefault(name) {
        if (LAYER.has(name)) {
            DEFAULT = LAYER.get(name);
        }
    }

    static getDefault() {
        return DEFAULT;
    }

    static getLayer(name) {
        return LAYER.get(name);
    }

    static hasLayer(name) {
        return LAYER.has(name);
    }

    static append(element, layer) {
        if (!!layer && WindowLayer.hasLayer(layer)) {
            WindowLayer.getLayer(layer).append(element);
        } else if (DEFAULT != null) {
            DEFAULT.append(element);
        } else {
            document.body.append(element);
        }
    }

}

customElements.define("emc-windowlayer", WindowLayer);
