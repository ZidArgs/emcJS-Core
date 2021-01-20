import GlobalStyle from "../../../../util/GlobalStyle.js";
import Toast from "./DefaultToast.js";

const STYLE = new GlobalStyle(`
#text {
    color: #9f6000;
    background-color: #feefb3;
}
`);

export default class WarningToast extends Toast {

    constructor(text = "", time = 0) {
        super(text, time);
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-toast-warning", WarningToast);
