import Message from "./Message.js";
// import TPL from "./ActionMessage.html" assert {type: "html"};
import STYLE from "./ActionMessage.css" assert {type: "css"};

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
