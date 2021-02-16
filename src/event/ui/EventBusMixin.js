import {createMixin} from "../../util/Mixin.js";
import EventBusSubset from "../EventBusSubset.js";

const ALLS = new WeakMap();
const SUBS = new WeakMap();
const EVENTS = new WeakMap();
const APPLIED = new WeakMap();

export default createMixin((superclass) => class EventBusMixin extends superclass {

    constructor(...args) {
        super(...args);
        SUBS.set(this, new Map());
        ALLS.set(this, new Set());
        EVENTS.set(this, new EventBusSubset());
        APPLIED.set(this, false);
    }

    triggerGlobal(name, data) {
        EVENTS.get(this).trigger(name, data);
    }

    registerGlobal(name, fn) {
        if (typeof name == "function") {
            ALLS.get(this).add(name);
            if (this.isConnected) {
                EVENTS.get(this).register(fn);
            }
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.registerGlobal(n, fn));
            } else {
                if (!SUBS.get(this).has(name)) {
                    const subs = new Set;
                    subs.add(fn);
                    SUBS.get(this).set(name, subs);
                } else {
                    SUBS.get(this).get(name).add(fn);
                }
                if (this.isConnected) {
                    EVENTS.get(this).register(name, fn);
                }
            }
        }
    }

    unregisterGlobal(name, fn) {
        if (typeof name == "function") {
            ALLS.get(this).delete(name);
            if (this.isConnected) {
                EVENTS.get(this).unregister(fn);
            }
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.unregisterGlobal(n, fn));
            } else {
                if (SUBS.get(this).has(name)) {
                    SUBS.get(this).get(name).delete(fn);
                    if (this.isConnected) {
                        EVENTS.get(this).unregister(name, fn);
                    }
                }
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const events = EVENTS.get(this);
        SUBS.get(this).forEach(function(subs, name) {
            subs.forEach(function(fn) {
                events.register(name, fn);
            });
        });
        ALLS.get(this).forEach(function(fn) {
            events.register(fn);
        });
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        EVENTS.get(this).clear();
    }

});
