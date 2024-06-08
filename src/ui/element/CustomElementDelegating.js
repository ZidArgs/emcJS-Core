import CustomElementMixin from "../mixin/CustomElementMixin.js";

export default class CustomElementDelegating extends CustomElementMixin(HTMLElement) {

    constructor() {
        if (new.target === CustomElementDelegating) {
            throw new Error("can not construct abstract class");
        }
        super();
    }

    static get delegatesFocus() {
        return true;
    }

}
