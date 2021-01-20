import GlobalStyle from "../../../../util/GlobalStyle.js";
import Toast from "./DefaultToast.js";

const STYLE = new GlobalStyle(`
#text {
    color: rgb(66 120 0);
    background-color: rgb(189 248 202);
}
`);

export default class SuccessToast extends Toast {

    constructor(text = "", time = 0) {
        super(text, time);
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-toast-success", SuccessToast);
