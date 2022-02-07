export default class Enum {

    #symbolRef = new Map();

    #nameRef = new Map();

    constructor(...names) {
        for (const name of names) {
            if (typeof name !== "string") {
                throw new Error(`name ${name} is of type ${typeof name} - expected string`);
            }
            const symbol = Symbol(name);
            this.#symbolRef.set(symbol, name);
            this.#nameRef.set(name, symbol);
            Object.defineProperty(this, name, {
                enumerable: true,
                writable: false,
                configurable: false,
                value: symbol
            });
        }
        return Object.freeze(this);
    }

    get size() {
        return this.#symbolRef.size;
    }

    values() {
        const values = [];
        for (const value of this.#symbolRef.keys()) {
            values.push(value);
        }
        return values;
    }

    has(symbol) {
        if (typeof symbol !== "symbol") {
            throw new Error(`name ${symbol} is of type ${typeof symbol} - expected symbol`);
        }
        return this.#symbolRef.has(symbol);
    }

    getName(symbol) {
        if (typeof symbol !== "symbol") {
            throw new Error(`name ${symbol} is of type ${typeof symbol} - expected symbol`);
        }
        if (!this.#symbolRef.has(symbol)) {
            throw `can not find name for symbol ${symbol}`;
        }
        return this.#symbolRef.get(symbol);
    }

    valueOf(name) {
        if (typeof name !== "string") {
            throw new Error(`name ${name} is of type ${typeof name} - expected name`);
        }
        if (!this.#nameRef.has(name)) {
            throw `can not find symbol for name ${name}`;
        }
        return this.#nameRef.get(name);
    }

    toString() {
        const names = [];
        for (const name of this.#symbolRef.values()) {
            names.push(name);
        }
        return `Enum(${names.join(", ")})`;
    }

}
