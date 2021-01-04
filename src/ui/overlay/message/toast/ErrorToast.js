import GlobalStyle from "../../../../util/GlobalStyle.js";
import Toast from "./DefaultToast.js";

const STYLE = new GlobalStyle(`
#text {
    color: #d8000c;
    background-color: #ffd2d2;
}
`);

export default class ErrorToast extends Toast {

    constructor(text = "", time = 0) {
        super(text, time);
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define('emc-toast-error', ErrorToast);

