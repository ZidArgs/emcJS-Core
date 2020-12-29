import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

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
    z-index: 100;
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

export default class Tooltip extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get position() {
        return this.getAttribute('position');
    }

    set position(val) {
        this.setAttribute('position', val);
    }

}

customElements.define('emc-tooltip', Tooltip);
