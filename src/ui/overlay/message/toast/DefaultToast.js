import Template from "../../../../util/Template.js";
import GlobalStyle from "../../../../util/GlobalStyle.js";

// TODO needs popin/popout animation

const TPL = new Template(`
<span id="text"></span>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    justify-content: center;
    margin: 5px;
    cursor: pointer;
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
    text-align: center;
}
`);

const TIME = new WeakMap();

export default class Toast extends HTMLElement {

    constructor(text = "", time = 0) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        time = parseInt(time);
        if (isNaN(time) || time < 2) {
            time = 2;
        }
        TIME.set(this, time);
        /* --- */
        const textEl = this.shadowRoot.getElementById('text');
        textEl.innerHTML = text;
    }

    connectedCallback() {
        const time = TIME.get(this);
        const t = setTimeout(() => {
            this.remove();
        }, time * 1000);
        this.onclick = () => {
            clearTimeout(t);
            this.remove();
        };
    }

}

customElements.define('emc-toast', Toast);
