import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

// TODO should be self destructing html element
// TODO static popover creation
// TODO integrate into toast overlay container

const TPL = new Template(`
<span id="text"></span>
<button id="close" title="close">✖</button>
<div id="autoclose"></div>
`);

const STYLE = new GlobalStyle(`
@keyframes autoclose {
    0% { width: calc(100% - 27px) }
    100% { width: 0 }
}
:host {
    position: fixed;
    display: flex;
    justify-content: center;
    right: 50px;
    top: 50px;
    cursor: pointer;
    pointer-events: none;
    z-index: 999999999;
}
#text {
    position: relative;
    box-sizing: border-box;
    disply: inline-block;
    padding: 20px;
    box-shadow: 5px 5px 20px black;
    whitespace: pre;
    color: #000000;
    background-color: #ffffff;
    pointer-events: all;
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
    cursor: pointer;
    -webkit-appearance: none;
    font-size: 10px;
    line-height: 1em;
    pointer-events: all;
}
#close:hover {
    color: white;
    background-color: red;
}
#autoclose-wrapper {
    position: absolute;
    right: 22px;
    top: 2px;
    left: 5px;
    height: 2px;
}
#autoclose {
    position: absolute;
    right: 22px;
    top: 2px;
    width: calc(100% - 27px);
    height: 2px;
    background: red;
}
`);

function removeElement() {
    document.body.removeChild(this);
}

class PopOver {

    show(text = "", time = 5) {
        const el = document.createElement('div');
        el.attachShadow({mode: 'open'});
        el.shadowRoot.append(TPL.generate());
        STYLE.apply(el.shadowRoot);
        /* --- */
        const textEl = el.shadowRoot.getElementById('text');
        textEl.innerHTML = text;
        const autocloseEL = el.shadowRoot.getElementById('autoclose');
        const removeEl = removeElement.bind(el);
        time = parseInt(time);
        if (isNaN(time) || time < 5) {
            time = 5;
        }
        autocloseEL.style.animation = `autoclose ${time}s linear 1`;
        autocloseEL.addEventListener("animationend", removeEl);
        textEl.onclick = function(ev) {
            autocloseEL.removeEventListener("animationend", removeEl);
            document.body.removeChild(el);
        }
        el.shadowRoot.getElementById('close').onclick = function(ev) {
            autocloseEL.removeEventListener("animationend", removeEl);
            document.body.removeChild(el);
            ev.stopPropagation();
        }
        document.body.append(el);
        return el;
    }

}

export default new PopOver;
