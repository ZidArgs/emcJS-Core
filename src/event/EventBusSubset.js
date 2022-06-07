import EventBus from "./EventBus.js";

export default class EventBusSubset {

    #alls = new Set();

    #subs = new Map();

    constructor() {
        EventBus.register((data = {name:"", data:{}}) => {
            if (this.#subs.has(data.name)) {
                this.#subs.get(data.name).forEach(function(fn) {
                    fn(data);
                });
            }
            this.#alls.forEach(function(fn) {
                fn(data);
            });
        });
    }

    trigger(name, data) {
        EventBus.trigger(name, data);
    }

    register(name, fn) {
        if (typeof name == "function") {
            this.#alls.add(name);
        } else if (Array.isArray(name)) {
            name.forEach((n) => this.register(n, fn));
        } else if (!this.#subs.has(name)) {
            const subs = new Set;
            subs.add(fn);
            this.#subs.set(name, subs);
        } else {
            this.#subs.get(name).add(fn);
        }
    }

    unregister(name, fn) {
        if (typeof name == "function") {
            this.#alls.delete(name);
        } else if (Array.isArray(name)) {
            name.forEach((n) => this.unregister(n, fn));
        } else if (this.#subs.has(name)) {
            this.#subs.get(name).delete(fn);
        }
    }

    clear() {
        this.#alls.clear();
        this.#subs.clear();
    }

}
