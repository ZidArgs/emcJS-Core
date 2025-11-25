import EventTargetManager from "../../event/EventTargetManager.js";
import i18n from "../../I18n.js";

const EVENT_MANAGER = new EventTargetManager(i18n);
const INSTANCES = new Map();

function retrieveInstance(attr) {
    const instanceRef = INSTANCES.get(attr);
    return instanceRef?.deref();
}

export class I18nValueObserver extends EventTarget {

    static {
        EVENT_MANAGER.set("language", () => {
            for (const [key, instanceRef] of INSTANCES) {
                const instance = instanceRef.deref();
                if (instance == null) {
                    INSTANCES.delete(key);
                    continue;
                }
                if (key) {
                    const event = new Event("change");
                    event.value = i18n.get(key);
                    instance.dispatchEvent(event);
                }
            }
        });
        EVENT_MANAGER.set("translation", (event) => {
            for (const [key, instanceRef] of INSTANCES) {
                const instance = instanceRef.deref();
                if (instance == null) {
                    INSTANCES.delete(key);
                    continue;
                }
                if (key && event.changes[key] != null) {
                    const event = new Event("change");
                    event.value = event.changes[key];
                    instance.dispatchEvent(event);
                }
            }
        });
    }

    #key;

    constructor(key) {
        const instance = retrieveInstance(key);
        if (instance != null) {
            return instance;
        }
        // ---
        super();
        this.#key = key;
        INSTANCES.set(key, new WeakRef(this));
    }

    get key() {
        return this.#key;
    }

    get value() {
        return i18n.get(this.#key);
    }

}

