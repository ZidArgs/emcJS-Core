import {isPrimitive} from "../util/helper/CheckType.js";

class EnumIterator extends Iterator {

    #values;

    constructor(values) {
        super();
        this.#values = Array.from(values);
    }

    static {
        Object.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "Enum Iterator",
            configurable: true,
            enumerable: false,
            writable: false
        });

        delete this.prototype.constructor;
    }

    next() {
        if (this.#values.length) {
            const value = this.#values.shift();
            return {
                value: value,
                done: false
            };
        }
        return {
            value: undefined,
            done: true
        };
    }

}

const DEFAULT_VALUES = new WeakMap();

export default class Enum {

    #value;

    constructor(value) {
        if (!isPrimitive(value)) {
            throw new TypeError("only primitive values allowed");
        }
        this.#value = value;
        // ---
        if (!DEFAULT_VALUES.has(new.target)) {
            DEFAULT_VALUES.set(new.target, this);
        }
    }

    get value() {
        return this.#value;
    }

    equals(inst) {
        return this === inst || (inst instanceof Enum && this.value === inst.value) || this.value === inst;
    }

    valueOf() {
        return this.#value;
    }

    toString() {
        return this.#value.toString();
    }

    toJSON() {
        return this.toString();
    }

    static get defaultValue() {
        return DEFAULT_VALUES.get(this);
    }

    static get(value) {
        for (const inst of Object.values(this)) {
            if (inst.value === value) {
                return inst;
            }
        }
    }

    static includes(value, insensitive = false) {
        if (insensitive) {
            return this.values().map((e) => e.toLowerCase()).includes(value.toString().toLowerCase());
        }
        return this.values().includes(value.toString());
    }

    static values() {
        return this.asArray().map((v) => this[v].value);
    }

    static asArray() {
        return Object.keys(this).filter((v) => this[v] instanceof this);
    }

    static toString() {
        return `Enum(${this.asArray().join(", ")})`;
    }

    static toJSON() {
        return this.toString();
    }

    static [Symbol.iterator]() {
        return new EnumIterator(Object.entries(this).filter(([, v]) => v instanceof this));
    }

}
