export class ListIncludesEntryObserver extends EventTarget {

    #key;

    #value = false;

    constructor(list, key) {
        super();
        if (!Array.isArray(list) && !(list instanceof Set)) {
            throw new TypeError("wrong type on parameter 1, expected Array or Set");
        }
        if (key != null && typeof key !== "string") {
            throw new TypeError("wrong type on parameter 2, expected string");
        }
        list = new Set(list);
        this.#key = key;
        this.#value = list.has(key);
    }

    updateValue(list) {
        if (!Array.isArray(list) && !(list instanceof Set)) {
            throw new TypeError("wrong type on parameter 1, expected Array or Set");
        }
        list = new Set(list);
        const value = list.has(this.#key);
        if (this.#value != value) {
            this.#value = value;
            const event = new Event("change");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get key() {
        return this.#key;
    }

    get value() {
        return this.#value;
    }

    onChange(fn) {
        if (!(typeof fn === "function")) {
            throw new TypeError("Failed to execute 'onChange' on 'ListEntryObserver': parameter 1 is not of type 'function'.");
        }
        this.addEventListener("change", fn);
    }

    unChange(fn) {
        if (!(typeof fn === "function")) {
            throw new TypeError("Failed to execute 'unChange' on 'ListEntryObserver': parameter 1 is not of type 'function'.");
        }
        this.removeEventListener("change", fn);
    }

}
