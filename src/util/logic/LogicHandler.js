import {
    debounce
} from "../Debouncer.js";
import EventTargetManager from "../event/EventTargetManager.js";
import LogicCompiler from "./LogicCompiler.js";

const EVENTS = ["load", "clear", "change"];

export default class LogicHandler extends EventTarget {

    #storage = null;

    #value = true;

    #logic = null;

    #data = new Map();

    constructor(storage, logic = true, events = EVENTS) {
        super();
        this.#storage = storage;
        this.#compileLogic(logic, events);
    }

    #compileLogic(logic, events) {
        if (typeof logic == "object") {
            this.#logic = LogicCompiler.compile(logic);
            this.#value = this.#execute();
            if (events.length > 0) {
                const storageEventManager = new EventTargetManager(this.#storage);
                storageEventManager.set(events, () => {
                    this.#update();
                });
            }
        } else if (logic != null) {
            this.#logic = logic;
            this.#value = !!logic;
        }
    }

    #getValue(key) {
        return this.#data.get(key) ?? this.#storage.get(key);
    }

    #execute() {
        return !!this.#logic((key) => {
            return this.#getValue(key);
        });
    }

    #update = debounce(() => {
        if (typeof this.#logic == "function") {
            const value = this.#execute();
            if (this.#value != value) {
                this.#value = value;
                const event = new Event("change");
                event.value = value;
                this.dispatchEvent(event);
            }
        }
    });

    setDataValue(key, value) {
        const old = this.#data.get(key);
        if (old != value) {
            this.#data.set(key, value);
            this.#update();
        }
    }

    removeDataValue(key) {
        if (this.#data.has(key)) {
            this.#data.delete(key);
            this.#update();
        }
    }

    clearData() {
        this.#data.clear();
        this.#update();
    }

    get value() {
        return !!this.#value;
    }

}
