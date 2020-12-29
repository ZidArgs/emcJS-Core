const REG = new Map();

export default class Panel extends HTMLElement {

    constructor() {
        super();
        if (new.target === Panel) {
            throw new TypeError("can not construct abstract class");
        }
    }

    static registerReference(ref, clazz) {
        if (REG.has(ref)) {
            throw new Error(`reference ${ref} already exists`);
        }
        REG.set(ref, clazz);
    }

    static getReference(ref) {
        if (REG.has(ref)) {
            return REG.get(ref);
        }
        //return PanelError;
    }

}
