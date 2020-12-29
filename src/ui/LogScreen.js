import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";

const TPL = new Template(`
<div id="title">Title</div>
<slot id="container"></slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 10px;
}
#title {
    margin: 10px 0;
    font-size: 2em;
    line-height: 1em;
}
#container {
    display: block;
    flex: 1;
    padding: 5px;
    resize: none;
    overflow: scroll;
    background-color: var(--edit-background-color, #ffffff);
    color: var(--edit-text-color, #000000);
    word-wrap: unset;
    white-space: pre;
    user-select: text;
    font-family: monospace;
}
::slotted(*) {
    display: block;
    padding: 2px;
    user-select: text;
    border: transparent;
    border-bottom: solid 1px rgba(255,255,255,0.1);
}
::slotted(:first-child) {
    border-top: solid 1px rgba(255,255,255,0.1);
}
`);

export default class LogScreen extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    set title(value) {
        this.setAttribute('title', value);
    }

    get title() {
        return this.getAttribute('title');
    }

    static get observedAttributes() {
        return ['title'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'title':
                if (oldValue != newValue) {
                    const title = this.shadowRoot.getElementById("title");
                    title.innerText = newValue;
                }
                break;
        }
    }
    

}

customElements.define('emc-logscreen', LogScreen);
