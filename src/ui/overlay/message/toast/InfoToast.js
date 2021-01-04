import GlobalStyle from "../../../../util/GlobalStyle.js";
import Toast from "./DefaultToast.js";

const STYLE = new GlobalStyle(`
#text {
    color: #00529b;
    background-color: #bde5f8;
}
`);

export default class InfoToast extends Toast {

    constructor(text = "", time = 0) {
        super(text, time);
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define('emc-toast-info', InfoToast);
