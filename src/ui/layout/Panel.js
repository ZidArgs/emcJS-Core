import CustomElement from "../CustomElement.js";

const REG = new Map();

export default class Panel extends CustomElement {

    constructor() {
        super();
        /* --- */
        if (new.target === Panel) {
            throw new TypeError("can not construct abstract class");
        }
    }

    static registerReference(ref, clazz) {
        if (!(clazz.prototype instanceof Panel)) {
            throw new TypeError("registered class must extend the Panel class");
        }
        REG.set(ref, clazz);
    }

    static getReference(ref) {
        if (REG.has(ref)) {
            return REG.get(ref);
        }
    }

}
