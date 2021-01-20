const SYMBOL_REF = new WeakMap();
const NAME_REF = new WeakMap();

export default class Enum {

    constructor(...names) {
        const symbolRef = new Map();
        const nameRef = new Map();
        for (const name of names) {
            if (typeof name !== "string") {
                throw new Error(`name ${name} is of type ${typeof name} - expected string`);
            }
            const symbol = Symbol(name);
            symbolRef.set(symbol, name);
            symbolRef.set(name, symbol);
            Object.defineProperty(this, name, {
                enumerable: true,
                writable: false,
                configurable: false,
                value: symbol
            });
        }
        SYMBOL_REF.set(this, symbolRef);
        NAME_REF.set(this, nameRef);
        return Object.freeze(this);
    }

    get size() {
        return SYMBOL_REF.get(this).size;
    }

    values() {
        const symbolRef = SYMBOL_REF.get(this);
        const values = [];
        for (const value of symbolRef.keys()) {
            values.push(value);
        }
        return values;
    }

    has(symbol) {
        if (typeof symbol !== "symbol") {
            throw new Error(`name ${symbol} is of type ${typeof symbol} - expected symbol`);
        }
        const symbolRef = SYMBOL_REF.get(this);
        return symbolRef.has(symbol);
    }

    getName(symbol) {
        if (typeof symbol !== "symbol") {
            throw new Error(`name ${symbol} is of type ${typeof symbol} - expected symbol`);
        }
        const symbolRef = SYMBOL_REF.get(this);
        if (!symbolRef.has(symbol)) {
            throw `can not find name for symbol ${symbol}`;
        }
        return symbolRef.get(symbol);
    }

    valueOf(name) {
        if (typeof name !== "string") {
            throw new Error(`name ${name} is of type ${typeof name} - expected name`);
        }
        const nameRef = NAME_REF.get(this);
        if (!nameRef.has(name)) {
            throw `can not find symbol for name ${name}`;
        }
        return nameRef.get(name);
    }

    toString() {
        const symbolRef = SYMBOL_REF.get(this);
        const names = [];
        for (const name of symbolRef.values()) {
            names.push(name);
        }
        return `Enum(${names.join(", ")})`;
    }

}
