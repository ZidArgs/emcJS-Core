import Template from "../../../util/Template.js";
import GlobalStyle from "../../../util/GlobalStyle.js";
/* --- */
import Alert from "./alert/DefaultAlert.js";
/* --- */
import Toast from "./toast/DefaultToast.js";
import InfoToast from "./toast/InfoToast.js";
import SuccessToast from "./toast/SuccessToast.js";
import WarningToast from "./toast/WarningToast.js";
import ErrorToast from "./toast/ErrorToast.js";
/* --- */
import Message from "./message/DefaultMessage.js";
import ErrorMessage from "./message/ErrorMessage.js";

const TPL = new Template(`
<div class="container" id="message"></div>
<div class="container" id="toast"></div>
<div class="container" id="alert"></div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    position: fixed !important;
    display: flex;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 999999999;
    cursor: default;
    pointer-events: none;
}
.container {
    display: flex;
    flex: 1;
    padding: 20px;
    pointer-events: none;
}
.container * {
    pointer-events: all;
}
#message {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
}
#toast {
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
}
#alert {
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
}
`);

export default class MessageLayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    createPopOver(text, time, onClick) {
        const containerEl = this.shadowRoot.getElementById("alert");
        const newEl = new Alert(text, time);
        if (typeof onClick == "function") {
            newEl.addEventListener("click", onClick);
        }
        containerEl.append(newEl);
        return newEl;
    }
    
    createToast(text, time) {
        const containerEl = this.shadowRoot.getElementById("toast");
        const newEl = new Toast(text, time);
        containerEl.append(newEl);
        return newEl;
    }
    
    createInfoToast(text, time) {
        const containerEl = this.shadowRoot.getElementById("toast");
        const newEl = new InfoToast(text, time);
        containerEl.append(newEl);
        return newEl;
    }
    
    createSuccessToast(text, time) {
        const containerEl = this.shadowRoot.getElementById("toast");
        const newEl = new SuccessToast(text, time);
        containerEl.append(newEl);
        return newEl;
    }
    
    createWarnToast(text, time) {
        const containerEl = this.shadowRoot.getElementById("toast");
        const newEl = new WarningToast(text, time);
        containerEl.append(newEl);
        return newEl;
    }
    
    createErrorToast(text, time) {
        const containerEl = this.shadowRoot.getElementById("toast");
        const newEl = new ErrorToast(text, time);
        containerEl.append(newEl);
        return newEl;
    }
    
    createMessage(text, onClick) {
        const containerEl = this.shadowRoot.getElementById("message");
        const newEl = new Message(text);
        if (typeof onClick == "function") {
            newEl.addEventListener("click", onClick);
        }
        containerEl.append(newEl);
        return newEl;
    }
    
    createErrorMessage(text, onClick) {
        const containerEl = this.shadowRoot.getElementById("message");
        const newEl = new ErrorMessage(text);
        if (typeof onClick == "function") {
            newEl.addEventListener("click", onClick);
        }
        containerEl.append(newEl);
        return newEl;
    }

}

customElements.define("emc-messagelayer", MessageLayer);
