import Template from "../../../../util/Template.js";
import GlobalStyle from "../../../../util/GlobalStyle.js";

// TODO needs popin/popout animation

const TPL = new Template(`
<span id="text"></span>
<button id="close" title="close">✖</button>
<div id="autoclose-wrapper">
    <div id="autoclose"></div>
</div>
`);

const STYLE = new GlobalStyle(`
@keyframes autoclose {
    0% { width: 100% }
    100% { width: 0 }
}
:host {
    position: relative;
    display: flex;
    cursor: pointer;
    margin: 5px;
}
#text {
    position: relative;
    box-sizing: border-box;
    display: inline-block;
    min-width: 200px;
    padding: 20px;
    box-shadow: 5px 5px 20px black;
    whitespace: pre;
    color: #000000;
    background-color: #ffffff;
}
#close {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    width: 16px;
    height: 16px;
    border: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
    font-size: 10px;
    line-height: 1em;
    background-color: #dedede;
}
#close:hover {
    color: white;
    background-color: red;
}
#close:focus {
    outline: none;
}
#autoclose-wrapper {
    position: absolute;
    right: 20px;
    top: 2px;
    left: 2px;
    height: 4px;
    background-color: #dedede;
}
#autoclose {
    position: absolute;
    right: 0px;
    width: 100%;
    height: 100%;
    background: red;
}
`);

function removeElement() {
    this.remove();
}

export default class Alert extends HTMLElement {

    constructor(text = "", time = 5) {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        time = parseInt(time);
        if (isNaN(time) || time < 5) {
            time = 5;
        }
        /* --- */
        const removeEl = removeElement.bind(this);
        const autocloseEL = this.shadowRoot.getElementById("autoclose");
        autocloseEL.style.animation = `autoclose ${time}s linear 1`;
        autocloseEL.addEventListener("animationend", removeEl);
        const closeEl = this.shadowRoot.getElementById("close");
        closeEl.addEventListener("click", event => {
            autocloseEL.removeEventListener("animationend", removeEl);
            this.remove();
            event.stopPropagation();
        });
        const textEl = this.shadowRoot.getElementById("text");
        textEl.innerHTML = text;
        textEl.addEventListener("click", event => {
            autocloseEL.removeEventListener("animationend", removeEl);
            this.dispatchEvent(new Event("click"));
            this.remove();
            event.stopPropagation();
        });
    }

}

customElements.define("emc-alert", Alert);
