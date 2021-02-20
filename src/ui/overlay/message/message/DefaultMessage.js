import Template from "../../../../util/Template.js";
import GlobalStyle from "../../../../util/GlobalStyle.js";
import "../../../symbols/CloseSymbol.js";

// TODO needs popin/popout animation

const TPL = new Template(`
<span id="text"></span>
<button id="close" title="close">
    <emc-symbol-close></emc-symbol-close>
</button>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    display: flex;
    cursor: pointer;
    margin: 5px;
    background-color: #ffffff;
    box-shadow: 5px 5px 20px black;
}
#text {
    position: relative;
    box-sizing: border-box;
    display: inline-block;
    min-width: 200px;
    padding: 20px;
    whitespace: pre;
    color: #000000;
}
#close {
    position: relative;
    top: 0px;
    right: 0px;
    display: flex;
    width: 40px;
    height: 100%;
    flex-shrink: 0;
    border: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
    font-size: 20px;
    line-height: 1em;
    color: #00000042;
    background-color: transparent;
}
#close:hover {
    color: #000000a8;
}
#close:focus {
    outline: none;
}
`);

export default class Message extends HTMLElement {

    constructor(text = "") {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const closeEl = this.shadowRoot.getElementById("close");
        closeEl.addEventListener("click", event => {
            this.remove();
            event.stopPropagation();
        });
        const textEl = this.shadowRoot.getElementById("text");
        textEl.innerHTML = text;
        textEl.addEventListener("click", event => {
            this.dispatchEvent(new Event("click"));
            this.remove();
            event.stopPropagation();
        });
    }

}

customElements.define("emc-message", Message);
