import {
    createMixin
} from "../../util/Mixin.js";
import EventBusSubset from "../EventBusSubset.js";

export default createMixin((superclass) => class EventBusMixin extends superclass {

    #alls = new Set();

    #subs = new Map();

    #events = new EventBusSubset();

    triggerGlobal(name, data) {
        this.#events.trigger(name, data);
    }

    registerGlobal(name, fn) {
        if (typeof name == "function") {
            this.#alls.add(name);
            if (this.isConnected) {
                this.#events.register(fn);
            }
        } else if (Array.isArray(name)) {
            name.forEach((n) => this.registerGlobal(n, fn));
        } else {
            if (!this.#subs.has(name)) {
                const subs = new Set;
                subs.add(fn);
                this.#subs.set(name, subs);
            } else {
                this.#subs.get(name).add(fn);
            }
            if (this.isConnected) {
                this.#events.register(name, fn);
            }
        }
    }

    unregisterGlobal(name, fn) {
        if (typeof name == "function") {
            this.#alls.delete(name);
            if (this.isConnected) {
                this.#events.unregister(fn);
            }
        } else if (Array.isArray(name)) {
            name.forEach((n) => this.unregisterGlobal(n, fn));
        } else if (this.#subs.has(name)) {
            this.#subs.get(name).delete(fn);
            if (this.isConnected) {
                this.#events.unregister(name, fn);
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const events = this.#events;
        this.#subs.forEach(function(subs, name) {
            subs.forEach(function(fn) {
                events.register(name, fn);
            });
        });
        this.#alls.forEach(function(fn) {
            events.register(fn);
        });
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        this.#events.clear();
    }

});
