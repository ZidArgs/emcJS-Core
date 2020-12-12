import EventBus from "./EventBus.js";

const ALLS = new WeakMap();
const SUBS = new WeakMap();

export default class EventBusSubset {

    constructor() {
        SUBS.set(this, new Map());
        ALLS.set(this, new Set());
        EventBus.register((data = {name:"", data:{}}) => {
            if (SUBS.get(this).has(data.name)) {
                SUBS.get(this).get(data.name).forEach(function(fn) {
                    fn(data);
                });
            }
            ALLS.get(this).forEach(function(fn) {
                fn(data);
            });
        });
    }

    trigger(name, data) {
        EventBus.trigger(name, data);
    }

    register(name, fn) {
        if (typeof name == "function") {
            ALLS.get(this).add(name);
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.register(n, fn));
            } else {
                if (!SUBS.get(this).has(name)) {
                    const subs = new Set;
                    subs.add(fn);
                    SUBS.get(this).set(name, subs);
                } else {
                    SUBS.get(this).get(name).add(fn);
                }
            }
        }
    }

    unregister(name, fn) {
        if (typeof name == "function") {
            ALLS.get(this).delete(name);
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.unregister(n, fn));
            } else {
                if (SUBS.get(this).has(name)) {
                    SUBS.get(this).get(name).delete(fn);
                }
            }
        }
    }

    clear() {
        ALLS.get(this).clear();
        SUBS.get(this).clear();
    }

}
