import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomElement from "../CustomElement.js";
import TooltipLayer from "./TooltipLayer.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    position: absolute;
    display: none;
    padding: 5px;
    background-color: black;
    border-radius: 4px;
    box-shadow: 0 0 0 2px white;
    pointer-events: none;
    z-index: 900800;
}
:host([position="topleft"]) {
    right: 100%;
    bottom: 100%;
    transform: translate(-2px, -2px);
}
:host([position="top"]) {
    left: 50%;
    bottom: 100%;
    transform: translate(-50%, -10px);
}
:host([position="topright"]) {
    left: 100%;
    bottom: 100%;
    transform: translate(2px, -2px);
}
:host([position="right"]) {
    left: 100%;
    top: 50%;
    transform: translate(10px, -50%);
}
:host([position="bottomright"]) {
    left: 100%;
    top: 100%;
    transform: translate(2px, 2px);
}
:host([position="bottom"]) {
    left: 50%;
    top: 100%;
    transform: translate(-50%, 10px);
}
:host([position="bottomleft"]) {
    right: 100%;
    top: 100%;
    transform: translate(-2px, 2px);
}
:host([position="left"]) {
    right: 100%;
    top: 50%;
    transform: translate(-10px, -50%);
}
:host:after {
    position: absolute;
    display: block;
    border-width: 5px;
    border-style: solid;
    border-color: transparent black black transparent;
    box-shadow: 2px 2px 0 white;
    content: " ";
}
:host([position="topleft"]):after {
    display: block;
    right: -1px;
    bottom: -1px;
    transform: rotate(0) skew(10deg, 10deg);
}
:host([position="top"]):after {
    display: block;
    left: calc(50% - 5px);
    bottom: -4px;
    transform: rotate(45deg);
}
:host([position="topright"]):after {
    display: block;
    left: -1px;
    bottom: -1px;
    transform: rotate(90deg) skew(10deg, 10deg);
}
:host([position="right"]):after {
    display: block;
    top: calc(50% - 5px);
    left: -4px;
    transform: rotate(135deg);
}
:host([position="bottomright"]):after {
    display: block;
    left: -1px;
    top: -1px;
    transform: rotate(180deg) skew(10deg, 10deg);
}
:host([position="bottom"]):after {
    display: block;
    left: calc(50% - 5px);
    top: -4px;
    transform: rotate(-135deg);
}
:host([position="bottomleft"]):after {
    display: block;
    right: -1px;
    top: -1px;
    transform: rotate(-90deg) skew(10deg, 10deg);
}
:host([position="left"]):after {
    display: block;
    top: calc(50% - 5px);
    right: -4px;
    transform: rotate(-45deg);
}
`);

const LAYER_MARGIN = 5;
const TOOLTIP_MARGIN = 5;

function getLayerBounds(source) {
    const slot = source.assignedSlot;
    if (slot != null) {
        const host = slot.getRootNode().host;
        if (host instanceof TooltipLayer) {
            return slot.getBoundingClientRect();
        }
    }
    return document.body.getBoundingClientRect();
}

export default class Tooltip extends CustomElement {

    #top = 0;

    #left = 0;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    connectedCallback() {
        if (!this.hasAttribute("slot")) {
            this.setAttribute("slot", "tooltip");
        }
        this.initItems();
    }

    static get observedAttributes() {
        return ["slot"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "slot" && newValue != "tooltip") {
            this.setAttribute("slot", "tooltip");
        }
    }

    get top() {
        return this.#top;
    }

    get left() {
        return this.#left;
    }

    get active() {
        const val = this.getAttribute("active");
        return !!val && val != "false";
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    show(target) {
        if (!this.active) {
            this.active = true;
        }
        /* --- */
        let posX = 0;
        let posY = 0;
        const pRect = getLayerBounds(this);
        // const tRect = target.getBoundingClientRect();

        // TODO calcualte position
        posX = pRect.left + LAYER_MARGIN + TOOLTIP_MARGIN;
        posY = pRect.top + LAYER_MARGIN + TOOLTIP_MARGIN;

        // TODO calculate tooltip bound pointer
        this.setAttribute("position", "topleft");

        this.style.left = `${posX}px`;
        this.style.top = `${posY}px`;
        setTimeout(() => {
            this.initFocus();
        }, 0);
    }

    // TODO rename all close functions to hide?
    close() {
        if (this.active) {
            this.active = false;
        }
        /* --- */
        this.style.left = `${LAYER_MARGIN}px`;
        this.style.top = `${LAYER_MARGIN}px`;
    }

}

customElements.define("emc-tooltip", Tooltip);
