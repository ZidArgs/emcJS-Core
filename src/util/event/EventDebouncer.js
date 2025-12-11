export default class EventDebouncer {

    #target = null;

    #debounceTime = 0;

    #events = new Map();

    #timers = new Map();

    constructor(target, debounceTime = 0) {
        if (!(target instanceof EventTarget)) {
            throw new TypeError("target must be an instance of EventTarget");
        }
        this.#setTarget(target);
        this.#debounceTime = Math.max(0, debounceTime);
    }

    #setTarget(target) {
        if (target != null) {
            this.#target = new WeakRef(target);
        } else {
            this.#target = null;
        }
    }

    get target() {
        return this.#target?.deref();
    }

    add(type, key, data) {
        let event = this.#events.get(type);
        if (event == null) {
            event = new Event(type);
            event.data = {};
            this.#events.set(type, event);
        } else {
            const timer = this.#timers.get(type);
            clearTimeout(timer);
        }
        event.data[key] = data;
        const timer = setTimeout(() => {
            this.#timers.delete(type);
            this.#dispatchEvent(type);
        }, this.#debounceTime);
        this.#timers.set(type, timer);
    }

    #dispatchEvent(type) {
        const event = this.#events.get(type);
        if (event != null) {
            const target = this.#target?.deref();
            if (target != null) {
                this.#target.dispatchEvent(event);
            }
        }
    }

}
