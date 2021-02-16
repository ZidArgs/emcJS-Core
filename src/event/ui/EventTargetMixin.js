import {createMixin} from "../../util/Mixin.js";
import EventTargetManager from "../EventTargetManager.js";

const MANAGERS = new WeakMap();

export default createMixin((superclass) => class EventTargetMixin extends superclass {

    constructor(...args) {
        super(...args);
        MANAGERS.set(this, new Map());
    }

    switchTarget(id, newTarget) {
        const managers = MANAGERS.get(this);
        if (managers.has(id)) {
            const targetManager = managers.get(id);
            targetManager.switchTarget(newTarget);
        } else {
            managers.set(id, new EventTargetManager(newTarget));
        }
    }

    getTarget(id) {
        const managers = MANAGERS.get(this);
        return managers.get(id);
    }

    setTargetEventListener(id, name, fn) {
        const managers = MANAGERS.get(this);
        if (managers.has(id)) {
            const targetManager = managers.get(id);
            targetManager.set(name, fn);
        } else {
            const targetManager = new EventTargetManager();
            targetManager.set(name, fn);
            managers.set(id, targetManager);
        }
    }

    deleteTargetEventListener(id, name) {
        const managers = MANAGERS.get(this);
        if (managers.has(id)) {
            const targetManager = managers.get(id);
            targetManager.delete(name);
        }
    }

    clearTargetEventListener(id) {
        const managers = MANAGERS.get(this);
        if (managers.has(id)) {
            const targetManager = managers.get(id);
            targetManager.clear();
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const managers = MANAGERS.get(this);
        for (const [, targetManager] of managers) {
            targetManager.setActive(true);
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        const managers = MANAGERS.get(this);
        for (const [, targetManager] of managers) {
            targetManager.setActive(false);
        }
    }

});
