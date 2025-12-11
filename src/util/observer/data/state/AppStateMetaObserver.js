import AppState from "../../../../data/state/AppState.js";
import {debounce} from "../../../Debouncer.js";
import EventTargetManager from "../../../event/EventTargetManager.js";
import {isEqual} from "../../../helper/Comparator.js";

export default class AppStateMetaObserver extends EventTarget {

    static #instances = new Map();

    static #setInstance(state, key, inst) {
        if (this.#instances.has(state)) {
            const insts = this.#instances.get(state);
            insts.set(key, inst);
        } else {
            const insts = new Map();
            insts.set(key, inst);
            this.#instances.set(state, insts);
        }
    }

    static #getInstance(state, key) {
        const insts = this.#instances.get(state);
        return insts?.get(key);
    }

    #appStateEventManager;

    #key;

    #value;

    constructor(state, key) {
        if (!(state instanceof AppState)) {
            throw new TypeError("wrong type on parameter 1, expected AppState");
        }
        if (key != null && typeof key !== "string") {
            throw new TypeError("wrong type on parameter 2, expected string");
        }
        /* --- */
        const inst = AppStateMetaObserver.#getInstance(state, key);
        if (inst != null) {
            return inst;
        }
        super();
        /* --- */
        this.#appStateEventManager = new EventTargetManager(state);
        this.#key = key;
        this.#value = state.getMeta(key);
        /* --- */
        this.#appStateEventManager.set("meta", (event) => {
            const {
                key, value
            } = event.data;
            if (this.#key != null && this.#key === key) {
                this.#updateValue(value);
            }
        });
        this.#appStateEventManager.set("purge", () => {
            if (this.#key != null) {
                this.#updateValue(null);
            }
        });
        this.#appStateEventManager.set("load", () => {
            if (this.#key != null) {
                const newValue = state.getMeta(key);
                this.#updateValue(newValue);
            }
        });
        /* --- */
        AppStateMetaObserver.#setInstance(state, key, this);
    }

    set active(value) {
        this.#appStateEventManager.active = value;
        if (value) {
            this.#updateValue(this.value);
        }
    }

    get active() {
        return this.#appStateEventManager.active;
    }

    #updateValue = debounce((newValue) => {
        if (!isEqual(this.#value, newValue)) {
            const oldValue = this.#value;
            this.#value = newValue;
            // ---
            const ev = new Event("change");
            ev.value = newValue;
            ev.oldValue = oldValue;
            this.dispatchEvent(ev);
        }
    });

    get key() {
        return this.#key;
    }

    get value() {
        return this.#appStateEventManager.target.getMeta(this.#key);
    }

    set value(value) {
        if (value === null) {
            this.#appStateEventManager.target.deleteMeta(this.#key, value);
        } else {
            this.#appStateEventManager.target.setMeta(this.#key, value);
        }
    }

    onChange(fn) {
        if (!(typeof fn === "function")) {
            throw new TypeError("Failed to execute 'onChange' on 'AppStateMetaObserver': parameter 1 is not of type 'function'.");
        }
        this.addEventListener("change", fn);
    }

    unChange(fn) {
        if (!(typeof fn === "function")) {
            throw new TypeError("Failed to execute 'unChange' on 'AppStateMetaObserver': parameter 1 is not of type 'function'.");
        }
        this.removeEventListener("change", fn);
    }

}
