import {
    createMixin
} from "../util/Mixin.js";

export default createMixin((superclass) => class EventTargetListenerMixin extends superclass {

    #target = null;

    constructor(...args) {
        super(...args);
        /* --- */
        this.#target = new EventTarget();
    }

    addEventListener(type, listener, options) {
        this.#target.addEventListener(type, listener, options);
    }

    dispatchEvent(event) {
        this.#target.dispatchEvent.call(this, event);
    }

    removeEventListener(type, listener, options) {
        this.#target.removeEventListener(type, listener, options);
    }

});
