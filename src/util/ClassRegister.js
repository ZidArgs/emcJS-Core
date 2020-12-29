const REGISTER = new WeakMap();
const DEFAULT = new WeakMap();

export default class ClassRegister {

    constructor(DefClass) {
        REGISTER.set(this, new Map());
        DEFAULT.set(this, DefClass);
    }

    register(ref, RegClass) {
        const register = REGISTER.get(this);
        if (register.has(ref)) {
            const DefClass = DEFAULT.get(this);
            throw new Error(`type "${ref}" already exists in ${DefClass.name}`);
        }
        register.set(ref, RegClass);
    }

    create(ref, ...params) {
        const register = REGISTER.get(this);
        if (register.has(ref)) {
            const TypeClass = register.get(ref);
            return new TypeClass(...params);
        }
        const DefClass = DEFAULT.get(this);
        return new DefClass(...params);
    }

}
