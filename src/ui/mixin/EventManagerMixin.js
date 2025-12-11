import {createMixin} from "../../util/Mixin.js";
import EventManager from "../../util/event/EventManager.js";

export default createMixin((superclass) => class EventManagerMixin extends superclass {

    #eventManager = new EventManager(false);

    connectedCallback() {
        this.#eventManager.active = true;
        super.connectedCallback?.();
    }

    disconnectedCallback() {
        this.#eventManager.active = false;
        super.disconnectedCallback?.();
    }

    registerTargetEventHandler(target, name, handler, options) {
        this.#eventManager.set(target, name, handler, options);
    }

    unregisterTargetEventHandler(target, name, options) {
        this.#eventManager.delete(target, name, options);
    }

});
