import "../../symbols/CloseSymbol.js";
import AbstractMessage from "./AbstractMessage.js";
import TPL from "./Message.js.html" assert {type: "html"};
import STYLE from "./Message.js.css" assert {type: "css"};

// TODO needs popin/popout animation

const TIME = 0;

export default class Message extends AbstractMessage {

    constructor({text, time = TIME} = {}) {
        super({text});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const closeEl = this.shadowRoot.getElementById("close");
        closeEl.addEventListener("click", (event) => {
            event.stopPropagation();
            this.remove();
        });
        /* --- */
        time = parseInt(time) || TIME;
        if (time > 0) {
            const autocloseEL = this.shadowRoot.getElementById("autoclose");
            autocloseEL.style.animation = `autoclose ${time}s linear 1`;
            autocloseEL.addEventListener("animationend", (event) => {
                event.stopPropagation();
                this.remove();
            });
        }
    }

    static get defaultSlot() {
        return "top-right";
    }

}

customElements.define("emc-message", Message);
