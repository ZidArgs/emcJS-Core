import {
    createMixin
} from "../util/Mixin.js";
import EventTargetManager from "../util/event/EventTargetManager.js";

export default createMixin((superclass) => class EventTargetListenerMixin extends superclass {

    #manager = new Map();

    switchEventTarget(id, newTarget) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.switchTarget(newTarget);
        } else {
            this.#manager.set(id, new EventTargetManager(newTarget));
        }
    }

    getEventTarget(id) {
        return this.#manager.get(id);
    }

    setEventTargetListener(id, name, fn) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.set(name, fn);
        } else {
            const targetManager = new EventTargetManager();
            targetManager.set(name, fn);
            this.#manager.set(id, targetManager);
        }
    }

    deleteEventTargetListener(id, name) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.delete(name);
        }
    }

    clearEventTargetListener(id) {
        if (this.#manager.has(id)) {
            const targetManager = this.#manager.get(id);
            targetManager.clear();
        }
    }

    setEventTargetListenerActive(value) {
        for (const [, targetManager] of this.#manager) {
            targetManager.setActive(value);
        }
    }

});
