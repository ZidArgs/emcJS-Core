export default class Enum {

    #value;

    constructor(value) {
        if (typeof value == "object") {
            throw new TypeError("only primitive values allowed");
        }
        this.#value = value;
    }

    get value() {
        return this.#value;
    }

    valueOf() {
        return this.#value;
    }

    toString() {
        return this.#value.toString();
    }

    static toString() {
        const names = Object.keys(this).filter((v) => this[v] instanceof this);
        return `Enum(${names.join(", ")})`;
    }

}
