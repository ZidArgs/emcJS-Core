import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import CustomElement from "../../CustomElement.js";
import MessageLayer from "./MessageLayer.js";

const TPL = new Template(`
<span id="text"></span>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    justify-content: center;
    margin: 5px;
    color: var(--color, #000000);
    background-color: var(--background-color, #ffffff);
    box-shadow: #00000080 5px 5px 4px 2px;
    user-select: none;
    --color: #000000;
    --background-color: #ffffff;
}
#text {
    position: relative;
    box-sizing: border-box;
    display: inline-block;
    min-width: 200px;
    padding: 20px;
    white-space: pre;
    font-weight: bold;
}
:host([type="error"]) {
    --color: #d8000c;
    --background-color: #ffd2d2;
}
:host([type="info"]) {
    --color: #00529b;
    --background-color: #bde5f8;
}
:host([type="success"]) {
    --color: #427800;
    --background-color: #bdf8ca;
}
:host([type="warning"]) {
    --color: #9f6000;
    --background-color: #feefb3;
}
`);

const ALLOWED_SLOTS = [
    "top-left", "top-center", "top-right",
    "bottom-left", "bottom-center", "bottom-right"
];

export default class AbstractMessage extends CustomElement {

    constructor({text = "[text missing]"} = {}) {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const textEl = this.shadowRoot.getElementById("text");
        textEl.innerHTML = text;
        /* --- */
        MessageLayer.append(this);
    }

    connectedCallback() {
        if (!this.hasAttribute("slot")) {
            this.setAttribute("slot", this.constructor.defaultSlot);
        }
    }

    set type(value) {
        this.setAttribute("type", value);
    }

    get type() {
        return this.getAttribute("type");
    }

    static get observedAttributes() {
        return ["slot"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "slot" && !ALLOWED_SLOTS.includes(newValue)) {
            this.setAttribute("slot", this.constructor.defaultSlot);
        }
    }

    static get defaultSlot() {
        return "bottom-center";
    }

    static show(params) {
        if (typeof params == "object") {
            if (!Array.isArray(params)) {
                const {type = "", slot, ...p} = params;
                const el = new this(p);
                el.type = type;
                el.slot = slot;
                return el;
            } else {
                throw new TypeError("Array is not a valid value");
            }
        } else {
            return new this(params);
        }
    }
    
    static success(params) {
        if (typeof params == "object") {
            if (!Array.isArray(params)) {
                return this.show({...params, type: "success"});
            } else {
                throw new TypeError("Array is not a valid value");
            }
        } else {
            return this.show({text: params, type: "success"});
        }
    }
    
    static info(params) {
        if (typeof params == "object") {
            if (!Array.isArray(params)) {
                return this.show({...params, type: "info"});
            } else {
                throw new TypeError("Array is not a valid value");
            }
        } else {
            return this.show({text: params, type: "info"});
        }
    }
    
    static warn(params) {
        if (typeof params == "object") {
            if (!Array.isArray(params)) {
                return this.show({...params, type: "warning"});
            } else {
                throw new TypeError("Array is not a valid value");
            }
        } else {
            return this.show({text: params, type: "warning"});
        }
    }
    
    static error(params) {
        if (typeof params == "object") {
            if (!Array.isArray(params)) {
                return this.show({...params, type: "error"});
            } else {
                throw new TypeError("Array is not a valid value");
            }
        } else {
            return this.show({text: params, type: "error"});
        }
    }

}
