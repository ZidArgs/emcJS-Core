import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

const TPL = new Template(`
<slot id="menu"></slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    position: fixed !important;
    display: none;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99999;
    cursor: default;
}
:host([active]:not([active="false"])) {
    display: block;
}
#menu {
    position: relative;
    display: inline-block;
    overflow: auto;
    max-width: calc(100vw - 50px);
    max-height: calc(100vh - 50px);
    background: var(--contextmenu-background, #ffffff);
    border: solid 2px var(--contextmenu-border, #cccccc);
}
::slotted(.item) {
    display: flex;
    align-items: center;
    min-width: 150px;
    min-height: 40px;
    padding: 5px;
    color: var(--contextmenu-text, #000000);
    background: var(--contextmenu-background, #ffffff);
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
}
::slotted(.item:hover) {
    background: var(--contextmenu-background-hover, var(--contextmenu-border, #cccccc));
    color: var(--contextmenu-text-hover, var(--contextmenu-text, #000000));
}
::slotted(.splitter) {
    display: block;
    margin: 10px 5px;
    height: 2px;
    background: var(--contextmenu-text, #000000);
    cursor: default;
    user-select: none;
    box-sizing: border-box;
}
`);

function closeMenu(ev) {
    const event = new Event('close');
    this.dispatchEvent(event);
    this.active = false;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

const TOP = new WeakMap();
const LEFT = new WeakMap();

export default class ContextMenu extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        TOP.set(this, 0);
        LEFT.set(this, 0);
        this.addEventListener("click", closeMenu.bind(this));
        this.addEventListener("contextmenu", closeMenu.bind(this));
        this.shadowRoot.getElementById('menu').addEventListener("click", closeMenu.bind(this));
    }

    get top() {
        return TOP.get(this);
    }

    get left() {
        return LEFT.get(this);
    }

    get active() {
        return this.getAttribute('active');
    }

    set active(val) {
        this.setAttribute('active', val);
    }

    show(posX, posY) {
        LEFT.set(this, posX);
        TOP.set(this, posY);
        this.active = true;
        const menu = this.shadowRoot.getElementById('menu');
        if (posX < 25) {
            posX = 25;
        } else if (menu.clientWidth + posX > window.innerWidth - 25) {
            posX = window.innerWidth - menu.clientWidth - 25;
        }
        if (posY < 25) {
            posY = 25;
        } else if (menu.clientHeight + posY > window.innerHeight - 25) {
            posY = window.innerHeight - menu.clientHeight - 25;
        }
        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;
    }

    loadItems(config = []) {
        this.innerHTML = "";
        if (Array.isArray(config)) {
            for (const entry of config) {
                if (entry == "splitter") {
                    const el = document.createElement("div");
                    el.classList.add("splitter");
                    this.append(el);
                } else if (entry instanceof HTMLElement) {
                    this.append(entry);
                } else if (typeof entry == "object" && !Array.isArray(entry)) {
                    const el = document.createElement("div");
                    el.classList.add("item");
                    el.innerHTML = entry.content;
                    el.addEventListener("click", event => {
                        if (typeof entry.action == "function") {
                            entry.action();
                        }
                        if (typeof entry.event == "string") {
                            this.dispatchEvent(new Event(entry.event));
                        }
                        /* --- */
                        event.preventDefault();
                        return false;
                    });
                    this.append(el);
                }
            }
        }
    }

}

customElements.define('emc-contextmenu', ContextMenu);
