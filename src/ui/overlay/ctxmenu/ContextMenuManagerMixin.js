// frameworks
import EventTargetManager from "../../../event/EventTargetManager.js";
import {createMixin} from "../../../util/Mixin.js";
import CtxMenuLayer from "./CtxMenuLayer.js";

const CTX_COUNTER = new WeakMap();
const DEFAULT_MENU_ID = "main";
const MENU_CLASSES = new WeakMap();
const MENUS = new WeakMap();
const EVENT_MANAGERS = new WeakMap();
const INTERNAL_EVENT_MANAGERS = new WeakMap();

function getInternalEventManager(target, name) {
    const eventManagers = INTERNAL_EVENT_MANAGERS.get(target);
    if (!eventManagers.has(name)) {
        const manager = new EventTargetManager();
        manager.set("show", () => {
            showCtxMenu(target);
        });
        manager.set("close", () => {
            closeCtxMenu(target);
        });
        eventManagers.set(name, manager);
        return manager;
    } else {
        return eventManagers.get(name);
    }
}

function getEventManager(target, name) {
    const eventManagers = EVENT_MANAGERS.get(target);
    if (!eventManagers.has(name)) {
        const manager = new EventTargetManager();
        eventManagers.set(name, manager);
        return manager;
    } else {
        return eventManagers.get(name);
    }
}

function showCtxMenu(inst) {
    const cnt = CTX_COUNTER.get(inst) + 1;
    CTX_COUNTER.set(inst, cnt);
    if (cnt > 0) {
        inst.classList.add("ctx-marked");
    }
}

function closeCtxMenu(inst) {
    const cnt = Math.max(CTX_COUNTER.get(inst) - 1, 0);
    CTX_COUNTER.set(inst, cnt);
    if (cnt <= 0) {
        inst.classList.remove("ctx-marked");
    }
}

export default createMixin((superclass) => class ContextMenuManagerMixin extends superclass {

    constructor(...args) {
        super(...args);
        MENUS.set(this, new Map());
        MENU_CLASSES.set(this, new Map());
        INTERNAL_EVENT_MANAGERS.set(this, new Map());
        EVENT_MANAGERS.set(this, new Map());
        CTX_COUNTER.set(this, 0);
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

    showDefaultContextMenu(event) {
        this.showContextMenu(DEFAULT_MENU_ID, event);
    }

    addDefaultContextMenuHandler(event, handler) {
        this.addContextMenuHandler(DEFAULT_MENU_ID, event, handler);
    }

    setContextMenu(name, MenuClass) {
        const menus = MENUS.get(this);
        const menuClasses = MENU_CLASSES.get(this);
        menuClasses.set(name, MenuClass);
        if (menus.has(name)) {
            const oldMenu = menus.get(name);
            if (!(oldMenu instanceof MenuClass)) {
                const internalManager = getInternalEventManager(this, name);
                const manager = getEventManager(this, name);
                internalManager.switchTarget(null);
                manager.switchTarget(null);
                oldMenu.remove();
            }
        }
    }

    getContextMenu(name) {
        const menus = MENUS.get(this);
        if (menus.has(name)) {
            return menus.get(name);
        }
        const menuClasses = MENU_CLASSES.get(this);
        const MenuClass = menuClasses.get(name);
        const ctxMnu = new MenuClass();
        menus.set(name, ctxMnu);
        /* --- */
        const internalManager = getInternalEventManager(this, name);
        const manager = getEventManager(this, name);
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

    showContextMenu(name, event) {
        const mnu_ctx = this.getContextMenu(name);
        if (mnu_ctx != null) {
            mnu_ctx.show(event.clientX, event.clientY);
        }
    }

    addContextMenuHandler(name, event, handler) {
        const manager = getEventManager(this, name);
        manager.set(event, handler);
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const catcherEl = CtxMenuLayer.findNextLayer(this);
        const menus = MENUS.get(this);
        for (const [, menu] of menus) {
            catcherEl.append(menu);
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        const menus = MENUS.get(this);
        for (const [, menu] of menus) {
            menu.remove();
        }
    }

});
