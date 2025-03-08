import "../../symbols/CloseSymbol.js";
import AbstractMessage from "./AbstractMessage.js";
import TPL from "./Message.js.html" assert {type: "html"};
import STYLE from "./Message.js.css" assert {type: "css"};

// TODO needs popin/popout animation

const TIME = 0;

export default class Message extends AbstractMessage {

    #closeEl;

    #autocloseEL;

    constructor({text, time = TIME} = {}) {
        super({text});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#closeEl = this.shadowRoot.getElementById("close");
        this.#closeEl.addEventListener("click", (event) => {
            event.stopPropagation();
            this.remove();
        });
        /* --- */
        time = parseInt(time) || TIME;
        if (time > 0) {
            this.#autocloseEL = this.shadowRoot.getElementById("autoclose");
            this.#autocloseEL.style.animation = `autoclose ${time}s linear 1`;
            this.#autocloseEL.addEventListener("animationend", (event) => {
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
