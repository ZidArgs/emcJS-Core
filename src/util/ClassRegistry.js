const REGISTRY = new WeakMap();
const DEFAULT = new WeakMap();

export default class ClassRegistry {

    constructor(DefClass) {
        REGISTRY.set(this, new Map());
        DEFAULT.set(this, DefClass);
    }

    register(ref, RegClass) {
        const register = REGISTRY.get(this);
        if (register.has(ref)) {
            const DefClass = DEFAULT.get(this);
            throw new Error(`type "${ref}" already exists in ${DefClass.name}`);
        }
        register.set(ref, RegClass);
    }

    create(ref, ...params) {
        const register = REGISTRY.get(this);
        if (register.has(ref)) {
            const TypeClass = register.get(ref);
            return new TypeClass(...params);
        }
        const DefClass = DEFAULT.get(this);
        return new DefClass(...params);
    }

}
