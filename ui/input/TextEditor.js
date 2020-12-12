import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

const TPL = new Template(`
<div id="title">Title</div>
<textarea id="text"></textarea>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 10px;
}
#title {
    margin: 10px 0;
    font-size: 2em;
    line-height: 1em;
}
#text {
    flex: 1;
    padding: 5px;
    resize: none;
    overflow: scroll;
    background-color: var(--edit-background-color, #ffffff);
    color: var(--edit-text-color, #000000);
    word-wrap: unset;
    white-space: pre;
    user-select: text;
}
`);

export default class TextEditor extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const text = this.shadowRoot.getElementById("text");
        let textTimer = null;
        text.addEventListener("input", (event) => {
            if (textTimer) {
                clearTimeout(textTimer);
            }
            textTimer = setTimeout(() => {
                const event = new Event('change');
                event.value = text.value;
                this.dispatchEvent(event);
            }, 1000);
        });
        text.addEventListener("contextmenu", function(event) {
            event.stopPropagation();
        });
    }

    set title(value) {
        this.setAttribute('title', value);
    }

    get title() {
        return this.getAttribute('title');
    }

    set value(value) {
        const notes = this.shadowRoot.getElementById("text");
        notes.value = value;
    }

    get value() {
        const notes = this.shadowRoot.getElementById("text");
        return notes.value;
    }

    static get observedAttributes() {
        return ['title'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'title':
                if (oldValue != newValue) {
                    const title = this.shadowRoot.getElementById("title");
                    title.innerText = newValue;
                }
                break;
        }
    }
    

}

customElements.define('emc-texteditor', TextEditor);
