import GlobalStyle from "../../../util/GlobalStyle.js";
import Message from "./Message.js";

const STYLE = new GlobalStyle(`
:host {
    cursor: pointer;
}
`);

export default class ActionMessage extends Message {

    constructor({text, time} = {}) {
        super({text, time});
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", (event) => {
            event.stopPropagation();
            this.remove();
            this.dispatchEvent(new Event("action"));
        });
    }

}

customElements.define("emc-message-action", ActionMessage);
