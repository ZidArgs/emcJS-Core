import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import "../../symbols/CloseSymbol.js";
import AbstractMessage from "./AbstractMessage.js";

// TODO needs popin/popout animation

const TPL = new Template(`
<button id="close" title="close">
    <emc-symbol-close></emc-symbol-close>
</button>
<div id="autoclose"></div>
`);

const STYLE = new GlobalStyle(`
@keyframes autoclose {
    0% { width: calc(100% - 27px) }
    100% { width: 0 }
}
#close {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    width: 15px;
    height: 15px;
    border: none;
    align-items: center;
    justify-content: center;
    color: var(--color, #000000);
    background-color: transparent;
    cursor: pointer;
    -webkit-appearance: none;
    font-size: 10px;
    line-height: 1em;
    pointer-events: all;
}
#close:hover {
    color: var(--background-color, #ffffff);
    background-color: var(--color, #ff0000);
}
#close:focus {
    outline: none;
}
#autoclose {
    position: absolute;
    right: 22px;
    top: 7px;
    width: 0px;
    height: 4px;
    background-color: var(--color, #ff0000);
}
`);

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
