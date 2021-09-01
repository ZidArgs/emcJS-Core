import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";

const TPL = new Template(`
<div id="focus_catcher_top" tabindex="0"></div>
<slot id="menu"></slot>
<div id="focus_catcher_bottom" tabindex="0"></div>
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
::slotted(.item),
::slotted([menu-action]) {
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
::slotted(.item:hover),
::slotted([menu-action]:hover) {
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

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");
const CTX_MARGIN = 5;
const TOP = new WeakMap();
const LEFT = new WeakMap();

export default class ContextMenu extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        TOP.set(this, 0);
        LEFT.set(this, 0);
        /* --- */
        const menuEl = this.shadowRoot.getElementById("menu");
        menuEl.style.left = `${CTX_MARGIN}px`;
        menuEl.style.top = `${CTX_MARGIN}px`;
        menuEl.addEventListener("click", event => {
            this.close();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("click", event => {
            this.close();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.close();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("keydown", (event) => {
            const key = event.which || event.keyCode;
            if (key == 27) {
                this.close();
            }
            event.stopPropagation();
        });
        /* --- */
        const focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        focusTopEl.onfocus = this.focusLast.bind(this);
        const focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        focusBottomEl.onfocus = this.focusFirst.bind(this);
    }

    connectedCallback() {
        const itemEls = this.querySelectorAll("[menu-action]");
        for (const itemEl of Array.from(itemEls)) {
            const attr = itemEl.getAttribute("menu-action");
            if (attr) {
                itemEl.addEventListener("click", event => {
                    const ev = new Event(attr);
                    this.dispatchEvent(ev);
                    event.preventDefault();
                    return false;
                });
            }
        }
    }

    get top() {
        return TOP.get(this);
    }

    get left() {
        return LEFT.get(this);
    }

    get active() {
        const val = this.getAttribute("active");
        return !!val && val != "false";
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    show(posX, posY) {
        if (!this.active) {
            this.dispatchEvent(new Event("show"));
            this.active = true;
        }
        /* --- */
        const pRect = this.parentElement.parentElement.getBoundingClientRect();
        LEFT.set(this, posX);
        TOP.set(this, posY);
        const menuEl = this.shadowRoot.getElementById("menu");
        if (posX < pRect.x + CTX_MARGIN) {
            posX = pRect.x + CTX_MARGIN;
        } else {
            const bWidth = Math.min(pRect.width + pRect.x, window.innerWidth);
            if (menuEl.offsetWidth + posX > bWidth - CTX_MARGIN) {
                posX = bWidth - menuEl.offsetWidth - CTX_MARGIN;
            }
        }
        if (posY < pRect.y + CTX_MARGIN) {
            posY = pRect.y + CTX_MARGIN;
        } else {
            const bHeight = Math.min(pRect.height + pRect.y, window.innerHeight);
            if (menuEl.offsetHeight + posY > bHeight - CTX_MARGIN) {
                posY = bHeight - menuEl.offsetHeight - CTX_MARGIN;
            }
        }
        menuEl.style.left = `${posX}px`;
        menuEl.style.top = `${posY}px`;
        this.focusFirst();
    }

    close() {
        if (this.active) {
            this.dispatchEvent(new Event("close"));
            this.active = false;
        }
        /* --- */
        const menuEl = this.shadowRoot.getElementById("menu");
        menuEl.style.left = `${CTX_MARGIN}px`;
        menuEl.style.top = `${CTX_MARGIN}px`;
    }

    focusFirst() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        if (a.length) {
            a[0].focus();
        }
    }
    
    focusLast() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        if (a.length) {
            a[a.length - 1].focus();
        }
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
                    const attr = entry.getAttribute("menu-action");
                    if (attr) {
                        entry.addEventListener("click", event => {
                            const ev = new Event(attr);
                            this.dispatchEvent(ev);
                            /* --- */
                            event.preventDefault();
                            return false;
                        });
                    }
                } else if (typeof entry == "object" && !Array.isArray(entry)) {
                    const el = document.createElement("div");
                    el.classList.add("item");
                    el.innerHTML = entry.content;
                    /* --- */
                    if (typeof entry.action == "function") {
                        el.addEventListener("click", event => {
                            entry.action();
                            /* --- */
                            event.preventDefault();
                            return false;
                        });
                    }
                    /* --- */
                    if (typeof entry.menuAction == "string") {
                        el.setAttribute("menu-action", entry.menuAction);
                        el.addEventListener("click", event => {
                            const ev = new Event(entry.menuAction);
                            this.dispatchEvent(ev);
                            /* --- */
                            event.preventDefault();
                            return false;
                        });
                    }
                    this.append(el);
                }
            }
        }
    }

}

customElements.define("emc-contextmenu", ContextMenu);
