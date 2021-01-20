import GlobalStyle from "../../../../util/GlobalStyle.js";
import Message from "./DefaultMessage.js";

const STYLE = new GlobalStyle(`
:host {
    background-color: #ffd2d2;
}
#text {
    color: #d8000c;
}
`);

export default class ErrorMessage extends Message {

    constructor(text = "", time = 0) {
        super(text, time);
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-message-error", ErrorMessage);

