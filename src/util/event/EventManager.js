import IterableWeakMap from "../../data/collection/IterableWeakMap.js";
import EventTargetManager from "./EventTargetManager.js";

export default class EventManager {

    #eventTargetManagerList = new IterableWeakMap();

    #active;

    constructor(active = true) {
        this.#active = !!active;
    }

    set active(value) {
        value = !!value;
        if (this.#active != value) {
            this.#active = value;
            for (const [, eventTargetManager] of this.#eventTargetManagerList) {
                eventTargetManager.active = value;
            }
        }
    }

    get active() {
        return this.#active;
    }

    set(target, name, handler, options) {
        const eventTargetManager = this.#getOrCreateEventTargetManager(target);
        eventTargetManager.set(name, handler, options);
    }

    delete(target, name, options) {
        if (this.#eventTargetManagerList.has(target)) {
            const eventTargetManager = this.#eventTargetManagerList.get(target);
            eventTargetManager.delete(name, options);
        }
    }

    clear(target) {
        if (target != null) {
            if (this.#eventTargetManagerList.has(target)) {
                const eventTargetManager = this.#eventTargetManagerList.get(target);
                eventTargetManager.clear();
                this.#eventTargetManagerList.delete(target);
            }
        } else {
            for (const [, eventTargetManager] of this.#eventTargetManagerList) {
                eventTargetManager.clear();
            }
            this.#eventTargetManagerList.clear();
        }
    }

    #getOrCreateEventTargetManager(target) {
        const eventTargetManager = this.#eventTargetManagerList.get(target);
        if (eventTargetManager != null) {
            return eventTargetManager;
        }
        const newEventTargetManager = new EventTargetManager(target, this.active);
        this.#eventTargetManagerList.set(target, newEventTargetManager);
        return newEventTargetManager;
    }

}
