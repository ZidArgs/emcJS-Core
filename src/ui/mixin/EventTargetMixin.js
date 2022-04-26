import {
    createMixin
} from "../../util/Mixin.js";
import EventTargetManager from "../EventTargetManager.js";

export default createMixin((superclass) => class EventTargetMixin extends superclass {

    #manager = new Map();

    switchTarget(id, newTarget) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.switchTarget(newTarget);
        } else {
            this.#manager.set(id, new EventTargetManager(newTarget));
        }
    }

    getTarget(id) {
        return this.#manager.get(id);
    }

    setTargetEventListener(id, name, fn) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.set(name, fn);
        } else {
            const targetManager = new EventTargetManager();
            targetManager.set(name, fn);
            this.#manager.set(id, targetManager);
        }
    }

    deleteTargetEventListener(id, name) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.delete(name);
        }
    }

    clearTargetEventListener(id) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.clear();
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        for (const [, targetManager] of this.#manager) {
            targetManager.setActive(true);
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        for (const [, targetManager] of this.#manager) {
            targetManager.setActive(false);
        }
    }

});
