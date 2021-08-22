import GlobalStyle from "../../../util/GlobalStyle.js";
import AbstractMessage from "./AbstractMessage.js";

// TODO needs popin/popout animation

const STYLE = new GlobalStyle(`
:host {
    cursor: pointer;
}
#text {
    text-align: center;
}
`);

const TIME = 5;

export default class Toast extends AbstractMessage {

    constructor({text, time = TIME} = {}) {
        super({text});
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", (event) => {
            event.stopPropagation();
            this.remove();
        });
        /* --- */
        time = parseInt(time) || TIME;
        if (time > 0) {
            setTimeout(() => {
                this.remove();
            }, time * 1000);
        }
    }

}

customElements.define("emc-toast", Toast);
