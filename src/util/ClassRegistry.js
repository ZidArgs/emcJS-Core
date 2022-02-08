export default class ClassRegistry {

    #registry = new Map();

    #defaultClass;

    constructor(DefClass) {
        this.#defaultClass = DefClass;
    }

    register(ref, RegClass) {
        if (this.#registry.has(ref)) {
            throw new Error(`type "${ref}" already exists in ${this.#defaultClass.name}`);
        }
        this.#registry.set(ref, RegClass);
        return this;
    }

    create(ref, ...params) {
        if (typeof ref == "string" && ref) {
            if (this.#registry.has(ref)) {
                const TypeClass = this.#registry.get(ref);
                return new TypeClass(...params);
            }
            ref = `${ref}*`;
            while (ref.length - 1) {
                if (this.#registry.has(ref)) {
                    const TypeClass = this.#registry.get(ref);
                    return new TypeClass(...params);
                }
                ref = `${ref.slice(0, -2)}*`;
            }
            if (this.#registry.has("*")) {
                const TypeClass = this.#registry.get("*");
                return new TypeClass(...params);
            }
        }
        return new this.#defaultClass(...params);
    }

}
