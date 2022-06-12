import {
    debounce
} from "../../../util/Debouncer.js";
import CustomElement from "../../element/CustomElement.js";
import CtxMenuLayer from "./CtxMenuLayer.js";
import "./ContextMenuItem.js";
import TPL from "./ContextMenu.js.html" assert {type: "html"};
import STYLE from "./ContextMenu.js.css" assert {type: "css"};

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");
const LAYER_MARGIN = 5;

function getLayerBounds(source) {
    const slot = source.assignedSlot;
    if (slot != null) {
        const host = slot.getRootNode().host;
        if (host instanceof CtxMenuLayer) {
            return slot.getBoundingClientRect();
        }
    }
    return document.body.getBoundingClientRect();
}

export default class ContextMenu extends CustomElement {

    #top = 0;

    #left = 0;

    #items = [];

    #addedItems = [];

    #inactiveGroups = new Set();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const menuEl = this.shadowRoot.getElementById("menu");
        menuEl.style.left = `${LAYER_MARGIN}px`;
        menuEl.style.top = `${LAYER_MARGIN}px`;
        menuEl.addEventListener("click", (event) => {
            this.close();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("click", (event) => {
            this.close();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("contextmenu", (event) => {
            this.close();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("keyup", (event) => {
            if (event.key == "Enter" || event.key == "Escape") {
                this.close();
                /* --- */
                event.preventDefault();
                return false;
            }
        });
        /* --- */
        const focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        focusTopEl.onfocus = () => {
            this.focusLast();
        };
        const focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        focusBottomEl.onfocus = () => {
            this.focusFirst();
        };
        const focusEl = this.shadowRoot.getElementById("init_focus");
        focusEl.onblur = () => {
            focusEl.setAttribute("tabindex", "");
        }
    }

    connectedCallback() {
        if (!this.hasAttribute("slot")) {
            this.setAttribute("slot", "ctxmnu");
        }
        this.initItems();
    }

    static get observedAttributes() {
        return ["slot"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "slot" && newValue != "ctxmnu") {
            this.setAttribute("slot", "ctxmnu");
        }
    }

    get top() {
        return this.#top;
    }

    get left() {
        return this.#left;
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
            this.active = true;
        }
        /* --- */
        const pRect = getLayerBounds(this);
        this.#top = posY;
        this.#left = posX;
        const menuEl = this.shadowRoot.getElementById("menu");
        if (pRect.x >= 0 && posX < pRect.x + LAYER_MARGIN) {
            posX = pRect.x + LAYER_MARGIN;
        } else {
            const bWidth = Math.min(pRect.width + pRect.x, window.innerWidth);
            if (menuEl.offsetWidth + posX > bWidth - LAYER_MARGIN) {
                posX = bWidth - menuEl.offsetWidth - LAYER_MARGIN;
            }
        }
        if (pRect.y >= 0 && posY < pRect.y + LAYER_MARGIN) {
            posY = pRect.y + LAYER_MARGIN;
        } else {
            const bHeight = Math.min(pRect.height + pRect.y, window.innerHeight);
            if (menuEl.offsetHeight + posY > bHeight - LAYER_MARGIN) {
                posY = bHeight - menuEl.offsetHeight - LAYER_MARGIN;
            }
        }
        menuEl.style.left = `${posX}px`;
        menuEl.style.top = `${posY}px`;
        setTimeout(() => {
            this.initFocus();
        }, 0);
    }

    close() {
        if (this.active) {
            this.active = false;
        }
        /* --- */
        const menuEl = this.shadowRoot.getElementById("menu");
        menuEl.style.left = `${LAYER_MARGIN}px`;
        menuEl.style.top = `${LAYER_MARGIN}px`;
    }

    initFocus() {
        const focusEl = this.shadowRoot.getElementById("init_focus");
        focusEl.setAttribute("tabindex", "0");
        focusEl.focus();
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

    initItems() {
        const config = [];
        const itemEls = this.querySelectorAll("div.splitter, [menu-action]");
        for (const itemEl of Array.from(itemEls)) {
            const attr = itemEl.getAttribute("menu-action");
            if (attr != null) {
                config.push({menuAction: attr, content: itemEl.innerHTML});
            } else {
                config.push("splitter");
            }
        }
        this.setItems(config);
    }

    setItems(config = []) {
        if (Array.isArray(config)) {
            this.#items = config;
            this.#renderItems();
        }
    }

    setAddedItems(config = []) {
        if (Array.isArray(config)) {
            this.#addedItems = config;
            this.#renderItems();
        }
    }

    toggleGroupActive(name, value) {
        if (value) {
            this.#inactiveGroups.delete(name);
        } else {
            this.#inactiveGroups.add(name);
        }
        const itemEls = this.querySelectorAll(`[menu-group="${name}"]`);
        for (const itemEl of Array.from(itemEls)) {
            itemEl.classList.toggle("hidden", !value);
        }
    }

    afterRenderCallback() {
        // nothing
    }

    #renderItems = debounce(() => {
        this.innerHTML = "";
        if (Array.isArray(this.#items)) {
            for (const entry of this.#items) {
                this.#addItem(entry);
            }
        }
        if (Array.isArray(this.#addedItems)) {
            for (const entry of this.#addedItems) {
                this.#addItem(entry);
            }
        }
        this.afterRenderCallback();
        if (this.active) {
            const posY = this.#top;
            const posX = this.#left;
            this.show(posX, posY);
        }
    });

    #addItem(entry) {
        if (entry == "splitter") {
            const el = document.createElement("div");
            el.classList.add("splitter");
            this.append(el);
        } else if (entry instanceof HTMLElement) {
            this.append(entry);
            const attr = entry.getAttribute("menu-action");
            if (attr) {
                entry.addEventListener("click", (event) => {
                    this.#onElementChoice(attr);
                    /* --- */
                    event.preventDefault();
                    return false;
                });
                entry.addEventListener("keyup", (event) => {
                    if (event.key == "Enter") {
                        this.#onElementChoice(attr);
                        /* --- */
                        event.preventDefault();
                        return false;
                    }
                });
            }
        } else if (typeof entry == "object" && !Array.isArray(entry)) {
            if (entry.type == "splitter") {
                const el = document.createElement("div");
                el.classList.add("splitter");
                if (entry.group) {
                    el.setAttribute("menu-group", entry.group);
                    if (this.#inactiveGroups.has(entry.group)) {
                        el.classList.add("hidden");
                    }
                }
                this.append(el);
            } else if (!entry.type || entry.type == "item") {
                const el = document.createElement("emc-contextmenuitem");
                el.classList.add("item");
                if (entry.group) {
                    el.setAttribute("menu-group", entry.group);
                    if (this.#inactiveGroups.has(entry.group)) {
                        el.classList.add("hidden");
                    }
                }
                el.setAttribute("tabindex", "0");
                el.innerHTML = entry.content;
                el.info = entry.info;

                /* --- */
                if (typeof entry.action == "function") {
                    el.addEventListener("click", (event) => {
                        entry.action();
                        /* --- */
                        event.preventDefault();
                        return false;
                    });
                    el.addEventListener("keyup", (event) => {
                        if (event.key == "Enter") {
                            entry.action();
                            /* --- */
                            event.preventDefault();
                            return false;
                        }
                    });
                }
                /* --- */
                if (typeof entry.menuAction == "string") {
                    el.setAttribute("menu-action", entry.menuAction);
                    el.addEventListener("click", (event) => {
                        this.#onElementChoice(entry.menuAction);
                        /* --- */
                        event.preventDefault();
                        return false;
                    });
                    el.addEventListener("keyup", (event) => {
                        if (event.key == "Enter") {
                            this.#onElementChoice(entry.menuAction);
                            /* --- */
                            event.preventDefault();
                            return false;
                        }
                    });
                }
                this.append(el);
            }
        }
    }

    #onElementChoice(name) {
        const ev = new Event(name);
        ev.left = this.left;
        ev.top = this.top;
        this.dispatchEvent(ev);
    }

}

customElements.define("emc-contextmenu", ContextMenu);
