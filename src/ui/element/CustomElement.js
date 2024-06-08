import CustomElementMixin from "../mixin/CustomElementMixin.js";

export default class CustomElement extends CustomElementMixin(HTMLElement) {

    constructor() {
        if (new.target === CustomElement) {
            throw new Error("can not construct abstract class");
        }
        super();
    }

}
