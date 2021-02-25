import GlobalStyle from "../../util/GlobalStyle.js";

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    font-size: 0.5em;
    line-height: 1em;
    font-weight: bold;
    font-family: sans-serif;
    pointer-events: none;
}
`);

export default class Symbol extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
        this.shadowRoot.innerHTML = "▲";
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-symbol-chevron-up", Symbol);
