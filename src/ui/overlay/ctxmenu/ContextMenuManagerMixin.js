// frameworks
import EventTargetManager from "../../../util/event/EventTargetManager.js";
import {
    createMixin
} from "../../../util/Mixin.js";
import ActiveCounter from "../../../util/ActiveCounter.js";
import CtxMenuLayer from "./CtxMenuLayer.js";

const DEFAULT_MENU_ID = "main";

export default createMixin((superclass) => class ContextMenuManagerMixin extends superclass {

    #counter = new ActiveCounter();

    #internalEventManagers = new Map();

    #eventManagers = new Map();

    #menuClasses = new Map();

    #menus = new Map();

    #showCtxMenu() {
        if (this.#counter.add() > 0) {
            this.classList.add("ctx-marked");
        }
    }

    #closeCtxMenu() {
        if (this.#counter.remove() <= 0) {
            this.classList.remove("ctx-marked");
        }
    }

    #createInternalEventManager(name) {
        const manager = new EventTargetManager();
        manager.set("show", () => {
            this.#showCtxMenu();
        });
        manager.set("close", () => {
            this.#closeCtxMenu();
        });
        this.#internalEventManagers.set(name, manager);
        return manager;
    }

    #getInternalEventManager(name) {
        return this.#internalEventManagers.get(name) ?? this.#createInternalEventManager(name);
    }

    #createEventManager(name) {
        const manager = new EventTargetManager();
        this.#eventManagers.set(name, manager);
        return manager;
    }

    #getEventManager(name) {
        return this.#eventManagers.get(name) ?? this.#createEventManager(name);
    }

    #createMenu(name) {
        const MenuClass = this.#menuClasses.get(name);
        const ctxMnu = new MenuClass();
        this.#menus.set(name, ctxMnu);
        /* --- */
        const internalManager = this.#getInternalEventManager(this, name);
        const manager = this.#getEventManager(this, name);
        internalManager.switchTarget(ctxMnu);
        manager.switchTarget(ctxMnu);
        /* --- */
        if (this.isConnected) {
            const catcherEl = CtxMenuLayer.findNextLayer(this);
            catcherEl.append(ctxMnu);
        }
        /* --- */
        return ctxMnu;
    }

    get defaultContextMenuId() {
        return DEFAULT_MENU_ID;
    }

    setDefaultContextMenu(MenuClass) {
        this.setContextMenu(DEFAULT_MENU_ID, MenuClass);
    }

    getDefaultContextMenu() {
        return this.getContextMenu(DEFAULT_MENU_ID);
    }

    showDefaultContextMenu(event, ...props) {
        this.showContextMenu(DEFAULT_MENU_ID, event, ...props);
    }

    addDefaultContextMenuHandler(event, handler) {
        this.addContextMenuHandler(DEFAULT_MENU_ID, event, handler);
    }

    setContextMenu(name, MenuClass) {
        this.#menuClasses.set(name, MenuClass);
        const oldMenu = this.#menus.get(name);
        if (oldMenu != null && !(oldMenu instanceof MenuClass)) {
            const internalManager = this.#getInternalEventManager(this, name);
            const manager = this.#getEventManager(this, name);
            internalManager.switchTarget(null);
            manager.switchTarget(null);
            oldMenu.remove();
        }
    }

    getContextMenu(name) {
        return this.#menus.get(name) ?? this.#createMenu(name);
    }

    showContextMenu(name, event, ...props) {
        const mnu_ctx = this.getContextMenu(name);
        if (mnu_ctx != null) {
            if (event instanceof MouseEvent) {
                mnu_ctx.show(event.clientX, event.clientY, ...props);
            } else {
                mnu_ctx.show(event?.left ?? 0, event?.top ?? 0, ...props);
            }
        }
    }

    addContextMenuHandler(name, event, handler) {
        const manager = this.#getEventManager(this, name);
        manager.set(event, handler);
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const catcherEl = CtxMenuLayer.findNextLayer(this);
        for (const [, menu] of this.#menus) {
            catcherEl.append(menu);
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        for (const [, menu] of this.#menus) {
            menu.remove();
        }
    }

});
