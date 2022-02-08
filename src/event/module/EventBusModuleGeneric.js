import EventBusAbstractModule from "./EventBusAbstractModule.js";

export default class EventBusModuleGeneric extends EventBusAbstractModule {

    #subs = new Set();

    async triggerModuleEvent(payload) {
        this.#subs.forEach(function(fn) {
            fn(payload);
        });
    }

    /* remote */

    register(fn) {
        if (typeof fn == "function") {
            this.#subs.add(fn);
        }
    }

    unregister(fn) {
        if (typeof fn == "function") {
            this.#subs.delete(fn);
        }
    }

    trigger(name, data = {}) {
        const payload = {
            name: name,
            data: data
        };
        this.onModuleEvent(payload);
    }

    clear() {
        this.#subs.clear();
    }

}
