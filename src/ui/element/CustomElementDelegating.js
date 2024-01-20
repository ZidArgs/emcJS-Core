import CustomElement from "./CustomElement.js";

export default class CustomElementDelegating extends CustomElement {

    constructor() {
        if (new.target === CustomElementDelegating) {
            throw new Error("can not construct abstract class");
        }
        super(true);
    }

}
