import EventBusAbstractModule from "./EventBusAbstractModule.js";

const SUBS = new WeakMap();

export default class EventBusModuleGeneric extends EventBusAbstractModule {

    constructor() {
        super();
        SUBS.set(this, new Set());
    }

    async triggerModuleEvent(payload) {
        SUBS.get(this).forEach(function(fn) {
            fn(payload);
        });
    }

    /* remote */

    register(fn) {
        if (typeof fn == "function") {
            SUBS.get(this).add(fn);
        }
    }

    unregister(fn) {
        if (typeof fn == "function") {
            SUBS.get(this).delete(fn);
        }
    }

    trigger(name, data = {}) {
        const payload = {
            name: name,
            data: data
        };
        this.onModuleEvent(payload);
    }

}
