import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import SearchAnd from "../../util/search/SearchAnd.js";
import "./Option.js";

/* TODO
 * use same method as contextmenu for overlay
 * maybe even use an additional input for search and not remove value from view input
 */

const TPL = new Template(`
<input id="view" placeholder="Search..."></input>
<div id="scroll-container">
    <slot id="container">
        <div id="empty">no entries</div>
    </slot>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    min-width: 200px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
#view {
    height: 30px;
    padding: 0px 7px;
    font-size: inherit;
    border: solid 1px var(--primary-color-border, #000000);
}
#scroll-container {
    position: fixed;
    display: none;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--list-color-back, #ffffff);
    scrollbar-color: var(--list-color-hover, #b8b8b8) var(--list-color-border, #f1f1f1);
    border: solid 1px var(--primary-color-border, #000000);
    z-index: 1000;
    box-shadow: black 2px 2px 2px;
}
#scroll-container::-webkit-scrollbar-track {
    background-color: var(--list-color-border, #f1f1f1);
}
#scroll-container::-webkit-scrollbar-thumb {
    background-color: var(--list-color-hover, #b8b8b8);
}
slot {
    display: block;
    width: 100%;
}
::slotted([value]) {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 5px 10px;
    white-space: normal;
    color: var(--list-color-front, #000000);
    background-color: var(--list-color-back, #ffffff);
    border-bottom: solid 1px #eee;
}
::slotted([value][disabled]) {
    display: none;
}
::slotted([value]:hover) {
    background-color: var(--list-color-hover, #b8b8b8);
}
:host(:not([readonly])) ::slotted([value]:not(.active)),
:host([readonly="false"]) ::slotted([value]:not(.active)),
:host([multimode]:not([multimode="false"]):not([readonly])) ::slotted([value].active),
:host([readonly="false"][multimode]:not([multimode="false"])) ::slotted([value].active) {
    cursor: pointer;
}
#empty {
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
    min-height: 30px;
    padding: 5px;
    margin: 5px 2px;
    white-space: normal;
}
`);

export default class SearchSelect extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("container").addEventListener("slotchange", event => {
            const all = this.querySelectorAll(`[value]`);
            all.forEach(el => {
                if (el) {
                    el.onclick = clickOption.bind(this);
                    if (el.value == this.value) {
                        this.shadowRoot.getElementById("view").value = el.innerHTML;
                    }
                }
            });
        });
        const input = this.shadowRoot.getElementById("view");
        const container = this.shadowRoot.getElementById("scroll-container");
        this.addEventListener("focus", event => {
            if (!this.readonly) {
                input.focus();
            }
        });
        input.addEventListener("focus", event => {
            if (!this.readonly) {
                input.value = "";
                const thisRect = this.getBoundingClientRect();
                container.style.display = "block";
                container.style.width = `${thisRect.width}px`;
                const containerRect = container.getBoundingClientRect();
                if (thisRect.bottom + containerRect.height > window.innerHeight - 25) {
                    container.style.bottom = `${window.innerHeight - thisRect.top}px`;
                } else {
                    container.style.top = `${thisRect.bottom}px`;
                }
            }
        });
        window.addEventListener("wheel", event => {
            input.blur();
        });
        container.addEventListener("wheel", event => {
            event.stopPropagation();
            return false;
        });
        this.addEventListener("blur", cancelSelection.bind(this));
        input.addEventListener("input", event => {
            const all = this.querySelectorAll(`[value]`);
            const regEx = new SearchAnd(input.value);
            all.forEach(el => {
                if (el.innerText.match(regEx)) {
                    el.style.display = "";
                } else {
                    el.style.display = "none";
                }
            });
        }, true);
    }

    connectedCallback() {
        this.setAttribute('tabindex', 0);
        const all = this.querySelectorAll(`[value]`);
        if (!this.value && !!all.length) {
            this.value = all[0].value;
        }
        all.forEach(el => {
            if (el) {
                el.onclick = clickOption.bind(this);
            }
        });
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get readonly() {
        const val = this.getAttribute('readonly');
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['value', 'readonly'];
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'value':
                if (oldValue != newValue) {
                    const el = this.querySelector(`[value="${newValue}"]`);
                    if (el != null) {
                        this.shadowRoot.getElementById("view").value = el.innerHTML;
                    } else {
                        this.shadowRoot.getElementById("view").value = newValue;
                    }
                    const event = new Event('change');
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = newValue;
                    this.dispatchEvent(event);
                }
                break;
            case 'readonly':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("view").readonly = newValue;
                    if (newValue != null && newValue != "false") {
                        this.shadowRoot.getElementById("view").disabled = true;
                    } else {
                        this.shadowRoot.getElementById("view").disabled = false;
                    }
                }
                break;
        }
    }

}

customElements.define('emc-searchselect', SearchSelect);

function clickOption(event) {
    if (!this.readonly) {
        this.value = event.currentTarget.getAttribute("value");
        const container = this.shadowRoot.getElementById("scroll-container");
        container.style.display = "";
        container.style.bottom = "";
        container.style.top = "";
        const all = this.querySelectorAll(`[value]`);
        all.forEach(el => {
            el.style.display = "";
        });
    }
}

function cancelSelection(event) {
    const container = this.shadowRoot.getElementById("scroll-container");
    if (container.style.display != "") {
        const input = this.shadowRoot.getElementById("view");
        const selected = this.querySelector(`[value="${this.value}"]`);
        if (selected != null) {
            input.value = selected.innerHTML;
        } else {
            input.value = this.value;
        }
        container.style.display = "";
        container.style.bottom = "";
        container.style.top = "";
        const all = this.querySelectorAll(`[value]`);
        all.forEach(el => {
            el.style.display = "";
        });
    }
}
