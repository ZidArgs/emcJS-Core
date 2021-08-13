import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

// TODO should be self destructing html element
// TODO static popover creation
// TODO integrate into toast overlay container

const TPL = new Template(`
<span id="text"></span>
`);

const STYLE = new GlobalStyle(`
:host {
    position: fixed;
    display: flex;
    justify-content: center;
    left: 0;
    right: 0;
    bottom: 50px;
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
#text.info {
    color: #00529b;
    background-color: #bde5f8;
}
#text.warning {
    color: #9f6000;
    background-color: #feefb3;
}
#text.error {
    color: #d8000c;
    background-color: #ffd2d2;
}
`);

function appendToast(el, timeout) {
    if (parseInt(timeout) === 0) {
        el.onclick = () => {
            el.remove();
        };
    } else {
        const t = setTimeout(() => {
            el.remove();
        }, parseInt(timeout) || 5000);
        el.onclick = () => {
            clearTimeout(t);
            el.remove();
        };
    }
    document.body.append(el);
}

class Toast {

    show(text, timeout) {
        const el = document.createElement("div");
        el.attachShadow({mode: "open"});
        el.shadowRoot.append(TPL.generate());
        STYLE.apply(el.shadowRoot);
        /* --- */
        const txt = el.shadowRoot.getElementById("text");
        txt.innerHTML = text;
        appendToast(el, timeout);
    }
    
    success(text, timeout) {
        const el = document.createElement("div");
        el.attachShadow({mode: "open"});
        el.shadowRoot.append(TPL.generate());
        STYLE.apply(el.shadowRoot);
        /* --- */
        const txt = el.shadowRoot.getElementById("text");
        txt.innerHTML = text;
        txt.className = "success";
        appendToast(el, timeout);
    }
    
    info(text, timeout) {
        const el = document.createElement("div");
        el.attachShadow({mode: "open"});
        el.shadowRoot.append(TPL.generate());
        STYLE.apply(el.shadowRoot);
        /* --- */
        const txt = el.shadowRoot.getElementById("text");
        txt.innerHTML = text;
        txt.className = "info";
        appendToast(el, timeout);
    }
    
    warn(text, timeout) {
        const el = document.createElement("div");
        el.attachShadow({mode: "open"});
        el.shadowRoot.append(TPL.generate());
        STYLE.apply(el.shadowRoot);
        /* --- */
        const txt = el.shadowRoot.getElementById("text");
        txt.innerHTML = text;
        txt.className = "warning";
        appendToast(el, timeout);
    }
    
    error(text, timeout) {
        const el = document.createElement("div");
        el.attachShadow({mode: "open"});
        el.shadowRoot.append(TPL.generate());
        STYLE.apply(el.shadowRoot);
        /* --- */
        const txt = el.shadowRoot.getElementById("text");
        txt.innerHTML = text;
        txt.className = "error";
        appendToast(el, timeout);
    }

}

export default new Toast;
